
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.Order;
using TecnoFix.Src.DTO.EquipmentType;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Controller;

/// <summary>
/// Controlador de las órdenes de reparación.
/// </summary>
/// <param name="repairOrderService">Servicio de órdenes inyectado.</param>
/// <param name="equipmentTypeService">Servicio del catálogo de tipos de equipo (ADM-001).</param>
[ApiController]
[Route("api/orders")]
public class RepairOrderController(
    IRepairOrderService repairOrderService,
    IEquipmentTypeService equipmentTypeService) : ControllerBase
{
    private readonly IRepairOrderService _repairOrderService = repairOrderService;
    private readonly IEquipmentTypeService _equipmentTypeService = equipmentTypeService;

    /// <summary>
    /// Entrega los listados del formulario: clientes y tipos de equipo habilitados.
    /// </summary>
    [Authorize(Roles = "Tecnico,Administrador")]
    [HttpGet("form-options")]
    public async Task<ActionResult<RepairOrderFormOptionsDto>> GetFormOptions()
    {
        return Ok(await _repairOrderService.GetFormOptionsAsync());
    }

    /// <summary>
    /// Registra una nueva orden de reparación (ORD-001).
    /// </summary>
    [Authorize(Roles = "Tecnico,Administrador")]
    [HttpPost]
    public async Task<IActionResult> RegisterOrder([FromBody] RepairOrderCreateRequestDto request)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "No se pudo identificar al usuario autenticado" });
        }

        var result = await _repairOrderService.RegisterOrderAsync(request, userId.Value);

        if (!result.Success)
        {
            return BadRequest(new { message = result.Message, fieldErrors = result.FieldErrors });
        }

        return Ok(new
        {
            message = result.Message,
            orderNumber = result.OrderNumber,
            status = result.Status,
            receivedAt = result.ReceivedAt
        });
    }

    /// <summary>
    /// Registra un nuevo tipo de equipo desde el formulario de registrar orden (ORD-001).
    /// Reutiliza el servicio del catálogo (ADM-001), así el tipo queda habilitado en el catálogo.
    /// </summary>
    /// <returns>200 si se agregó, 400 si el nombre es inválido, 409 si ya existe.</returns>
    [Authorize(Roles = "Tecnico,Administrador")]
    [HttpPost("equipment-types")]
    public async Task<IActionResult> AddEquipmentType([FromBody] EquipmentTypeRequestDto request)
    {
        var result = await _equipmentTypeService.CreateAsync(request);

        if (result.Success)
        {
            return Ok(new { message = result.Message, equipmentType = result.EquipmentType });
        }

        var errorBody = new { message = result.Message, fieldErrors = result.FieldErrors };

        return result.IsDuplicateName ? Conflict(errorBody) : BadRequest(errorBody);
    }

    // --------------------------------------------------
    // ORD-002: Diagnóstico y presupuesto
    // --------------------------------------------------

    /// <summary>
    /// Obtiene las órdenes recibidas o que están en diagnóstico.
    /// </summary>
    [Authorize(Roles = "Tecnico,Administrador")]
    [HttpGet("diagnosis")]
    public async Task<ActionResult<List<RepairOrderDiagnosisListDto>>> GetOrdersForDiagnosis()
    {
        var orders = await _repairOrderService.GetOrdersForDiagnosisAsync();

        return Ok(orders);
    }

    /// <summary>
    /// Inicia el diagnóstico de una orden y cambia su estado a En diagnóstico.
    /// </summary>
    [Authorize(Roles = "Tecnico")]
    [HttpPut("{orderId:int}/start-diagnosis")]
    public async Task<IActionResult> StartDiagnosis(int orderId)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "No se pudo identificar al usuario autenticado" });
        }

        var success = await _repairOrderService.StartDiagnosisAsync(orderId, userId.Value);

        if (!success)
        {
            return BadRequest(new
            {
                message = "No se pudo iniciar el diagnóstico de la orden."
            });
        }

        return Ok(new
        {
            message = "El diagnóstico de la orden se inició correctamente."
        });
    }

    /// <summary>
    /// Registra el diagnóstico técnico y el presupuesto de una orden.
    /// </summary>
    
[Authorize(Roles = "Tecnico")]
[HttpPost("diagnosis/budget")]
public async Task<IActionResult> RegisterDiagnosisAndBudget(
    [FromBody] RepairOrderDiagnosisRequestDto request)
{
    var userId = GetCurrentUserId();

    if (userId is null)
    {
        return Unauthorized(new
        {
            message = "No se pudo identificar al usuario autenticado"
        });
    }

    var result = await _repairOrderService.RegisterDiagnosisAndBudgetAsync(
        request,
        userId.Value);

    if (!result.Success)
    {
        return BadRequest(new
        {
            message = result.Message,
            fieldErrors = result.FieldErrors
        });
    }

    return Ok(new
    {
        message = result.Message
    });
}


    /// <summary>
    /// Obtiene el id del usuario autenticado desde el token.
    /// </summary>
    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        return int.TryParse(value, out var id) ? id : null;
    }
}
