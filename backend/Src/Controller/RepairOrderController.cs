
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.Order;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Controller;

/// <summary>
/// Controlador de las órdenes de reparación.
/// </summary>
/// <param name="repairOrderService">Servicio de órdenes inyectado.</param>
[ApiController]
[Route("api/orders")]
public class RepairOrderController(IRepairOrderService repairOrderService) : ControllerBase
{
    private readonly IRepairOrderService _repairOrderService = repairOrderService;

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
