using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.DTO.Order;
using TecnoFix.Src.Model;

namespace TecnoFix.Src.Services;

/// <summary>
/// Seguimiento de órdenes para el cliente (ORD-005).
/// Es parte de RepairOrderService, en un archivo aparte para no mezclarlo con ORD-001 y ORD-002.
/// </summary>
public partial class RepairOrderService
{
    /// <inheritdoc />
    public async Task<List<OrderTrackingListItemDto>> GetClientOrdersAsync(int clientId)
    {
        // Solo las órdenes del cliente autenticado, la más reciente primero.
        return await _context.RepairOrders
            .AsNoTracking()
            .Where(order => order.ClientId == clientId)
            .OrderByDescending(order => order.OrderNumber)
            .Select(order => new OrderTrackingListItemDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                EquipmentType = order.EquipmentType.Name,
                BrandModel = order.BrandModel
            })
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<OrderTrackingDto?> GetOrderTrackingAsync(int orderId, int clientId)
    {
        // El filtro por ClientId impide consultar órdenes de otros clientes.
        var order = await _context.RepairOrders
            .AsNoTracking()
            .Include(item => item.EquipmentType)
            .Include(item => item.Logs)
                .ThenInclude(log => log.Responsible)
            .FirstOrDefaultAsync(item => item.Id == orderId && item.ClientId == clientId);

        if (order is null)
        {
            return null;
        }

        // El presupuesto existe solo cuando el técnico ya lo registró (ORD-002).
        OrderTrackingBudgetDto? budget = null;

        if (order.TotalCost is not null)
        {
            budget = new OrderTrackingBudgetDto
            {
                TechnicalDiagnosis = order.TechnicalDiagnosis,
                LaborCost = order.LaborCost ?? 0,
                PartsCost = order.PartsCost ?? 0,
                TotalCost = order.TotalCost.Value
            };
        }

        // Bitácora del evento más reciente al más antiguo, como pide la ERS.
        var logs = order.Logs
            .OrderByDescending(log => log.CreatedAt)
            .ThenByDescending(log => log.Id)
            .Select(log => new OrderTrackingLogDto
            {
                Status = log.NewStatus.ToDisplayName(),
                StatusCode = log.NewStatus.ToString(),
                Comment = log.Comment,
                CreatedAt = log.CreatedAt
            })
            .ToList();

        return new OrderTrackingDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            Status = order.Status.ToDisplayName(),
            StatusCode = order.Status.ToString(),
            EquipmentType = order.EquipmentType.Name,
            BrandModel = order.BrandModel,
            SerialNumber = order.SerialNumber,
            ReportedFault = order.ReportedFault,
            Budget = budget,
            Logs = logs
        };
    }
}