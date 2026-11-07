using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.Order;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Controllers;

/// <summary>
/// Controlador de las órdenes de reparación.
/// Registrar una orden lo pueden hacer el técnico y el administrador (ORD-001, NF02).
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
    /// <param name="request">Datos del equipo recibido.</param>
    /// <returns>200 con el número de orden, o 400 con "message" y "fieldErrors" por campo.</returns>
    [Authorize(Roles = "Tecnico,Administrador")]
    [HttpPost]
    public async Task<IActionResult> RegisterOrder([FromBody] RepairOrderCreateRequestDto request)
    {
        // El responsable se obtiene del token, nunca del cuerpo de la petición,
        // para que nadie pueda registrar una orden a nombre de otro usuario.
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
    /// Obtiene el id del usuario autenticado desde el token (claim "sub").
    /// Según la configuración, ASP.NET lo entrega como NameIdentifier o como "sub": se revisan ambos.
    /// </summary>
    private int? GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        return int.TryParse(value, out var id) ? id : null;
    }
}