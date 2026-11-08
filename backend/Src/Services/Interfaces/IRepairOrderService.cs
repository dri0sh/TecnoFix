
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

    Task<bool> RegisterDiagnosisAndBudgetAsync(
        RepairOrderDiagnosisRequestDto request,
        int technicianId);
}
