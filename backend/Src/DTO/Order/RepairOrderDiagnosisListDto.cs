namespace TecnoFix.Src.DTO.Order;

/// <summary>
/// Información de una orden pendiente de diagnóstico.
/// </summary>
public class RepairOrderDiagnosisListDto
{
    public int Id { get; set; }

    public string OrderNumber { get; set; } = string.Empty;

    public string ClientName { get; set; } = string.Empty;

    public string EquipmentType { get; set; } = string.Empty;

    public string BrandModel { get; set; } = string.Empty;

    public string ReportedFault { get; set; } = string.Empty;

    public DateTime ReceivedAt { get; set; }

    public string Status { get; set; } = string.Empty;
}