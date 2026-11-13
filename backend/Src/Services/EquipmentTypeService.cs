using Microsoft.EntityFrameworkCore;
using Npgsql;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.EquipmentType;
using TecnoFix.Src.Model;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Services;

/// <summary>
/// Implementa la gestión del catálogo de tipos de equipo (ADM-001).
/// </summary>
/// <param name="context">Contexto de acceso a la base de datos.</param>
public class EquipmentTypeService(TecnoFixDbContext context) : IEquipmentTypeService
{
    private const int MAX_NAME_LENGTH = 60;
    private const int MAX_DESCRIPTION_LENGTH = 250;

    private const string DUPLICATE_NAME_MESSAGE = "El tipo de equipo ingresado ya se encuentra registrado";

    private const string NAME_REQUIRED_MESSAGE = "Debe completar el campo Nombre";

    private const string ORDERS_IN_PROGRESS_MESSAGE = "El tipo de equipo tiene órdenes en proceso y no puede ser deshabilitado";

    private readonly TecnoFixDbContext _context = context;

    /// <inheritdoc />
    public async Task<List<EquipmentTypeDto>> GetAllAsync()
    {
        return await _context.EquipmentTypes.OrderBy(type => type.Name).Select(type => new EquipmentTypeDto
            {
                Id = type.Id,
                Name = type.Name,
                Description = type.Description,
                IsEnabled = type.IsEnabled
            }).ToListAsync();
    }

    /// <inheritdoc />
    public async Task<EquipmentTypeOperationResponseDto> CreateAsync(
        EquipmentTypeRequestDto request)
    {
        var name = (request.Name ?? string.Empty).Trim();

        var description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        var fieldErrors = ValidateFields(name, description);

        if (fieldErrors.Count > 0)
        {
            return new EquipmentTypeOperationResponseDto
            {
                Success = false,
                Message = fieldErrors.Values.First(),
                FieldErrors = fieldErrors
            };
        }

        if (await _context.EquipmentTypes.AnyAsync(type => type.Name.ToLower() == name.ToLower()))
        {
            return CreateDuplicateNameResponse();
        }

        var equipmentType = new EquipmentType
        {
            Name = name,
            Description = description,
            IsEnabled = true
        };

        _context.EquipmentTypes.Add(equipmentType);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            return CreateDuplicateNameResponse();
        }

        return CreateSuccessResponse(equipmentType, "Tipo de equipo registrado correctamente");
    }

    /// <inheritdoc />
    public async Task<EquipmentTypeOperationResponseDto> UpdateAsync(int id, EquipmentTypeRequestDto request)
    {
        var equipmentType = await _context.EquipmentTypes.FirstOrDefaultAsync(type => type.Id == id);

        if (equipmentType is null)
        {
            return new EquipmentTypeOperationResponseDto
            {
                Success = false,
                Message = "El tipo de equipo seleccionado no existe",
                IsNotFound = true
            };
        }

        var name = (request.Name ?? string.Empty).Trim();

        var description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        var fieldErrors = ValidateFields(name, description);

        if (fieldErrors.Count > 0)
        {
            return new EquipmentTypeOperationResponseDto
            {
                Success = false,
                Message = fieldErrors.Values.First(),
                FieldErrors = fieldErrors
            };
        }

        if (await _context.EquipmentTypes.AnyAsync(type => type.Id != id && type.Name.ToLower() == name.ToLower()))
        {
            return CreateDuplicateNameResponse();
        }

        equipmentType.Name = name;
        equipmentType.Description = description;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueViolation(ex))
        {
            return CreateDuplicateNameResponse();
        }

        return CreateSuccessResponse(equipmentType, "Tipo de equipo actualizado correctamente");
    }

    /// <inheritdoc />
    public async Task<EquipmentTypeOperationResponseDto> SetEnabledAsync(int id, bool isEnabled)
    {
        var equipmentType = await _context.EquipmentTypes.FirstOrDefaultAsync(type => type.Id == id);

        if (equipmentType is null)
        {
            return new EquipmentTypeOperationResponseDto
            {
                Success = false,
                Message = "El tipo de equipo seleccionado no existe",
                IsNotFound = true
            };
        }

        if (!isEnabled && equipmentType.IsEnabled)
        {
            var hasOrdersInProgress = await _context.RepairOrders.AnyAsync(order =>
                    order.EquipmentTypeId == id &&
                    order.Status != OrderStatus.Delivered);

            if (hasOrdersInProgress)
            {
                return new EquipmentTypeOperationResponseDto
                {
                    Success = false,
                    Message = ORDERS_IN_PROGRESS_MESSAGE,
                    HasOrdersInProgress = true
                };
            }
        }

        equipmentType.IsEnabled = isEnabled;

        await _context.SaveChangesAsync();

        var message = isEnabled ? "Tipo de equipo habilitado correctamente" : "Tipo de equipo deshabilitado correctamente";

        return CreateSuccessResponse(equipmentType, message);
    }

    /// <summary>
    /// Valida los campos definidos para ADM-001.
    /// </summary>
    private static Dictionary<string, string> ValidateFields(string name, string? description)
    {
        var errors = new Dictionary<string, string>();

        if (name.Length == 0)
        {
            errors["name"] = NAME_REQUIRED_MESSAGE;
        }
        else if (name.Length > MAX_NAME_LENGTH)
        {
            errors["name"] = $"El campo Nombre no puede superar los {MAX_NAME_LENGTH} caracteres";
        }

        if (description is not null && description.Length > MAX_DESCRIPTION_LENGTH)
        {
            errors["description"] = $"El campo Descripción no puede superar los {MAX_DESCRIPTION_LENGTH} caracteres";
        }

        return errors;
    }

    /// <summary>
    /// Construye la respuesta utilizada cuando el nombre ya está registrado.
    /// </summary>
    private static EquipmentTypeOperationResponseDto CreateDuplicateNameResponse() => new()
        {
            Success = false,
            Message = DUPLICATE_NAME_MESSAGE,
            FieldErrors = new Dictionary<string, string>
            {
                ["name"] = DUPLICATE_NAME_MESSAGE
            },
            IsDuplicateName = true
        };

    /// <summary>
    /// Construye una respuesta exitosa con los datos actualizados del tipo.
    /// </summary>
    private static EquipmentTypeOperationResponseDto CreateSuccessResponse(EquipmentType equipmentType, string message) => new()
        {
            Success = true,
            Message = message,
            EquipmentType = new EquipmentTypeDto
            {
                Id = equipmentType.Id,
                Name = equipmentType.Name,
                Description = equipmentType.Description,
                IsEnabled = equipmentType.IsEnabled
            }
        };

    /// <summary>
    /// Indica si la excepción corresponde a una violación del índice único de PostgreSQL.
    /// </summary>
    private static bool IsUniqueViolation(DbUpdateException ex) => ex.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation
        };
}