using Microsoft.EntityFrameworkCore;
using Npgsql;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.Order;
using TecnoFix.Src.Model;
using TecnoFix.Src.Services.Interfaces;
using TecnoFix.Src.Utils;

namespace TecnoFix.Src.Services;

/// <summary>
/// Implementa el registro de órdenes de reparación (ORD-001).
/// </summary>
/// <param name="context">Contexto de acceso a la base de datos.</param>
public class RepairOrderService(TecnoFixDbContext context) : IRepairOrderService
{
    private const string CLIENT_ROLE = "Cliente";

    // Comentario del primer evento de la bitácora
    private const string FIRST_LOG_COMMENT = "Orden registrada. Equipo recibido.";

    // Si dos usuarios registran una orden al mismo tiempo pueden calcular el mismo número;
    // el índice único lo impide y se reintenta con el número siguiente.
    private const int MAX_ORDER_NUMBER_ATTEMPTS = 3;

    private readonly TecnoFixDbContext _context = context;

    /// <inheritdoc />
    public async Task<RepairOrderFormOptionsDto> GetFormOptionsAsync()
    {
        // Clientes ordenados por nombre. Se muestra el RUT para distinguir clientes con el mismo nombre.
        var clients = await _context.Users
            .Where(user => user.Role != null && user.Role.Name == CLIENT_ROLE)
            .OrderBy(user => user.Name)
            .Select(user => new SelectOptionDto(
                user.Id,
                user.Rut == null ? user.Name : user.Name + " (" + user.Rut + ")"))
            .ToListAsync();

        // Solo los tipos de equipo habilitados se ofrecen al registrar una orden (ADM-001)
        var equipmentTypes = await _context.EquipmentTypes
            .Where(type => type.IsEnabled)
            .OrderBy(type => type.Name)
            .Select(type => new SelectOptionDto(type.Id, type.Name))
            .ToListAsync();

        return new RepairOrderFormOptionsDto
        {
            Clients = clients,
            EquipmentTypes = equipmentTypes
        };
    }

    /// <inheritdoc />
    public async Task<RepairOrderCreateResponseDto> RegisterOrderAsync(
        RepairOrderCreateRequestDto request,
        int registeredById)
    {
        // Se limpian los textos. Los campos opcionales vacíos se guardan como null.
        var brandModel = (request.BrandModel ?? string.Empty).Trim();
        var reportedFault = (request.ReportedFault ?? string.Empty).Trim();
        var serialNumber = string.IsNullOrWhiteSpace(request.SerialNumber) ? null : request.SerialNumber.Trim();
        var accessories = string.IsNullOrWhiteSpace(request.Accessories) ? null : request.Accessories.Trim();

        // 1. Campos obligatorios y largo máximo
        var fieldErrors = ValidateFields(request.ClientId, request.EquipmentTypeId, brandModel, reportedFault, serialNumber, accessories);

        // 2. El cliente debe existir y tener el rol Cliente
        if (request.ClientId is int clientId && !fieldErrors.ContainsKey("clientId"))
        {
            var clientExists = await _context.Users.AnyAsync(user =>
                user.Id == clientId && user.Role != null && user.Role.Name == CLIENT_ROLE);

            if (!clientExists)
            {
                fieldErrors["clientId"] = "El cliente seleccionado no existe";
            }
        }

        // 3. El tipo de equipo debe existir y estar habilitado (ADM-001)
        if (request.EquipmentTypeId is int equipmentTypeId && !fieldErrors.ContainsKey("equipmentTypeId"))
        {
            var equipmentTypeEnabled = await _context.EquipmentTypes
                .AnyAsync(type => type.Id == equipmentTypeId && type.IsEnabled);

            if (!equipmentTypeEnabled)
            {
                fieldErrors["equipmentTypeId"] = "El tipo de equipo seleccionado no está disponible";
            }
        }

        if (fieldErrors.Count > 0)
        {
            return new RepairOrderCreateResponseDto
            {
                Success = false,
                Message = fieldErrors.Values.First(),
                FieldErrors = fieldErrors
            };
        }

        // 4. Se arma la orden con el estado «Recibida» y la fecha y hora de recepción
        var receivedAt = DateTime.UtcNow;

        var order = new RepairOrder
        {
            ClientId = request.ClientId!.Value,
            EquipmentTypeId = request.EquipmentTypeId!.Value,
            BrandModel = brandModel,
            SerialNumber = serialNumber,
            ReportedFault = reportedFault,
            Accessories = accessories,
            Status = OrderStatus.Received,
            ReceivedAt = receivedAt,
            RegisteredById = registeredById
        };

        // 5. Primer evento de la bitácora. Se agrega a la colección de la orden para que
        //    ambos se guarden juntos en un solo SaveChanges (una sola transacción).
        order.Logs.Add(new OrderLog
        {
            CreatedAt = receivedAt,
            ResponsibleId = registeredById,
            PreviousStatus = null,
            NewStatus = OrderStatus.Received,
            Comment = FIRST_LOG_COMMENT
        });

        _context.RepairOrders.Add(order);

        // 6. Número de orden único y correlativo: el mayor número existente + 1
        for (int attempt = 1; attempt <= MAX_ORDER_NUMBER_ATTEMPTS; attempt++)
        {
            var lastOrderNumber = await _context.RepairOrders.MaxAsync(o => (int?)o.OrderNumber) ?? 0;
            order.OrderNumber = lastOrderNumber + 1;

            try
            {
                await _context.SaveChangesAsync();

                return new RepairOrderCreateResponseDto
                {
                    Success = true,
                    Message = $"Orden N.º {order.OrderNumber} registrada con estado «{order.Status.ToDisplayName()}».",
                    OrderNumber = order.OrderNumber,
                    Status = order.Status.ToDisplayName(),
                    ReceivedAt = order.ReceivedAt
                };
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex) && attempt < MAX_ORDER_NUMBER_ATTEMPTS)
            {
                // Otro usuario tomó el mismo número al mismo tiempo: se reintenta con el siguiente
            }
        }

        return new RepairOrderCreateResponseDto
        {
            Success = false,
            Message = "No se pudo generar el número de orden. Intente nuevamente."
        };
    }

    /// <summary>
    /// Valida los campos obligatorios de la tarjeta ORD-001 y el largo máximo de cada campo.
    /// </summary>
    /// <returns>Diccionario con el error de cada campo inválido (vacío si todo está correcto).</returns>
    private static Dictionary<string, string> ValidateFields(
        int? clientId,
        int? equipmentTypeId,
        string brandModel,
        string reportedFault,
        string? serialNumber,
        string? accessories)
    {
        var errors = new Dictionary<string, string>();

        if (clientId is null or <= 0)
        {
            errors["clientId"] = InputValidator.RequiredFieldMessage("Cliente");
        }

        if (equipmentTypeId is null or <= 0)
        {
            errors["equipmentTypeId"] = InputValidator.RequiredFieldMessage("Tipo de equipo");
        }

        if (brandModel.Length == 0)
        {
            errors["brandModel"] = InputValidator.RequiredFieldMessage("Marca y modelo");
        }
        else if (brandModel.Length > 100)
        {
            errors["brandModel"] = "El campo Marca y modelo no puede superar los 100 caracteres";
        }

        if (serialNumber is not null && serialNumber.Length > 60)
        {
            errors["serialNumber"] = "El campo Número de serie no puede superar los 60 caracteres";
        }

        if (reportedFault.Length == 0)
        {
            errors["reportedFault"] = InputValidator.RequiredFieldMessage("Descripción de la falla reportada");
        }
        else if (reportedFault.Length > 1000)
        {
            errors["reportedFault"] = "El campo Descripción de la falla reportada no puede superar los 1000 caracteres";
        }

        if (accessories is not null && accessories.Length > 250)
        {
            errors["accessories"] = "El campo Accesorios entregados no puede superar los 250 caracteres";
        }

        return errors;
    }

    /// <summary>
    /// Indica si el error se debe a un valor repetido en un índice único de PostgreSQL.
    /// </summary>
    private static bool IsUniqueViolation(DbUpdateException ex) =>
        ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };

        /// <summary>
    /// Obtiene las órdenes recibidas o en diagnóstico.
    /// </summary>
    public async Task<List<RepairOrderDiagnosisListDto>> GetOrdersForDiagnosisAsync()
    {
        return await _context.RepairOrders
            .Where(order =>
                order.Status == OrderStatus.Received ||
                order.Status == OrderStatus.InDiagnosis)
            .OrderBy(order => order.ReceivedAt)
            .Select(order => new RepairOrderDiagnosisListDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber.ToString(),
                ClientName = order.Client.Name,
                EquipmentType = order.EquipmentType.Name,
                BrandModel = order.BrandModel,
                ReportedFault = order.ReportedFault,
                ReceivedAt = order.ReceivedAt,
                Status = order.Status.ToDisplayName()
            })
            .ToListAsync();
    }

    /// <summary>
    /// Cambia el estado de una orden a En diagnóstico.
    /// </summary>
    
    public async Task<bool> StartDiagnosisAsync(int orderId, int technicianId)
    {
    var order = await _context.RepairOrders
        .FirstOrDefaultAsync(order => order.Id == orderId);

    // Solo se pueden iniciar órdenes que estén recibidas.
    if (order == null || order.Status != OrderStatus.Received)
    {
        return false;
    }

    var previousStatus = order.Status;
    var now = DateTime.UtcNow;

    // Actualizar estado y técnico responsable.
    order.Status = OrderStatus.InDiagnosis;
    order.ResponsibleTechnicianId = technicianId;

    // Registrar el cambio en la bitácora.
    order.Logs.Add(new OrderLog
    {
        CreatedAt = now,
        ResponsibleId = technicianId,
        PreviousStatus = previousStatus,
        NewStatus = OrderStatus.InDiagnosis,
        Comment = "El técnico inició el diagnóstico de la orden."
    });

    await _context.SaveChangesAsync();

    return true;
    }


    /// <summary>
    /// Registra el diagnóstico y presupuesto de una orden.
    /// </summary>
    
public async Task<RepairOrderDiagnosisResponseDto> RegisterDiagnosisAndBudgetAsync(
    RepairOrderDiagnosisRequestDto request,
    int technicianId)
{
    var result = new RepairOrderDiagnosisResponseDto();

    // Validar el diagnóstico técnico.
    var diagnosis = (request.TechnicalDiagnosis ?? string.Empty).Trim();

    if (string.IsNullOrWhiteSpace(diagnosis))
    {
        result.FieldErrors["technicalDiagnosis"] =
            "Debe completar el campo del diagnóstico técnico.";
    }

    // Validar costo de mano de obra.
    if (request.LaborCost == null)
    {
        result.FieldErrors["laborCost"] =
            "Debe completar el campo del costo de mano de obra.";
    }
    else if (request.LaborCost < 0)
    {
        result.FieldErrors["laborCost"] = "El costo ingresado no es válido";
    }

    // Validar costo de repuestos.
    if (request.PartsCost == null)
    {
        result.FieldErrors["partsCost"] =
            "Debe completar el campo del costo de repuestos.";
    }
    else if (request.PartsCost < 0)
    {
        result.FieldErrors["partsCost"] = "El costo ingresado no es válido";
    }

    if (result.FieldErrors.Count > 0)
    {
        result.Success = false;
        result.Message = result.FieldErrors.Values.First();
        return result;
    }

    var order = await _context.RepairOrders
        .FirstOrDefaultAsync(order => order.Id == request.OrderId);

    if (order == null)
    {
        result.Success = false;
        result.Message = "La orden seleccionada no existe.";
        return result;
    }

    if (order.Status != OrderStatus.InDiagnosis)
    {
        result.Success = false;
        result.Message = "La orden debe estar en diagnóstico para registrar el presupuesto.";
        return result;
    }

    // Calcular y validar el costo total.
    var totalCost = request.LaborCost!.Value + request.PartsCost!.Value;

    if (totalCost > 9999999999.99m)
    {
        result.Success = false;
        result.Message = "El costo ingresado no es válido";
        result.FieldErrors["totalCost"] = "El costo ingresado no es válido";
        return result;
    }

    var previousStatus = order.Status;
    var now = DateTime.UtcNow;

    order.TechnicalDiagnosis = diagnosis;
    order.LaborCost = request.LaborCost.Value;
    order.PartsCost = request.PartsCost.Value;
    order.TotalCost = totalCost;
    order.Status = OrderStatus.Budgeted;
    order.ResponsibleTechnicianId = technicianId;

    // Registrar el evento en la bitácora.
    order.Logs.Add(new OrderLog
    {
        CreatedAt = now,
        ResponsibleId = technicianId,
        PreviousStatus = previousStatus,
        NewStatus = OrderStatus.Budgeted,
        Comment = "Diagnóstico y presupuesto registrados. Total: " +
                  totalCost.ToString("F2")
    });

    await _context.SaveChangesAsync();

    result.Success = true;
    result.Message = "El diagnóstico y presupuesto se registraron correctamente.";

    return result;
}
}