
using TecnoFix.Src.DTO.Order;

namespace TecnoFix.Src.Services.Interfaces;

/// <summary>
/// Operaciones sobre las órdenes de reparación.
/// </summary>
public interface IRepairOrderService
{
    Task<RepairOrderFormOptionsDto> GetFormOptionsAsync();

    Task<RepairOrderCreateResponseDto> RegisterOrderAsync(
        RepairOrderCreateRequestDto request,
        int registeredById);

    // Métodos correspondientes a ORD-002.

    Task<List<RepairOrderDiagnosisListDto>> GetOrdersForDiagnosisAsync();

    Task<bool> StartDiagnosisAsync(
        int orderId,
        int technicianId);

    Task<RepairOrderDiagnosisResponseDto> RegisterDiagnosisAndBudgetAsync(
    RepairOrderDiagnosisRequestDto request,
    int technicianId);

      // Métodos correspondientes a ORD-005.

    /// <summary>
    /// Lista las órdenes del cliente indicado, de la más reciente a la más antigua.
    /// </summary>
    Task<List<OrderTrackingListItemDto>> GetClientOrdersAsync(int clientId);

    /// <summary>
    /// Entrega el seguimiento de una orden. Devuelve null si la orden no existe
    /// o no pertenece al cliente indicado.
    /// </summary>
    Task<OrderTrackingDto?> GetOrderTrackingAsync(int orderId, int clientId);

}
