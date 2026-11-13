using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.Order;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Controller;

/// <summary>
/// Controlador del seguimiento de órdenes para el cliente (ORD-005).
/// Comparte el prefijo api/orders con RepairOrderController.
/// </summary>
/// <param name="repairOrderService">Servicio de órdenes inyectado.</param>
[ApiController]
[Route("api/orders")]
public class OrderTrackingController(IRepairOrderService repairOrderService) : ControllerBase
{
    private readonly IRepairOrderService _repairOrderService = repairOrderService;

    /// <summary>
    /// Lista las órdenes del cliente autenticado.
    /// </summary>
    [Authorize(Roles = "Cliente")]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "No se pudo identificar al usuario autenticado" });
        }

        List<OrderTrackingListItemDto> orders = await _repairOrderService.GetClientOrdersAsync(userId.Value);

        return Ok(orders);
    }

    /// <summary>
    /// Entrega el seguimiento de una orden del cliente autenticado (ORD-005).
    /// Si la orden no es suya responde 404, igual que si no existiera.
    /// </summary>
    [Authorize(Roles = "Cliente")]
    [HttpGet("{orderId:int}/tracking")]
    public async Task<IActionResult> GetOrderTracking(int orderId)
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new { message = "No se pudo identificar al usuario autenticado" });
        }

        var tracking = await _repairOrderService.GetOrderTrackingAsync(orderId, userId.Value);

        if (tracking is null)
        {
            return NotFound(new { message = "No se encontró la orden seleccionada" });
        }

        return Ok(tracking);
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