namespace TecnoFix.Src.DTO.Order;

/// <summary>
/// Resumen de una orden para el selector del seguimiento (ORD-005).
/// </summary>
public class OrderTrackingListItemDto
{
    public int Id { get; set; }

    public int OrderNumber { get; set; }

    public string EquipmentType { get; set; } = string.Empty;

    public string BrandModel { get; set; } = string.Empty;
}

/// <summary>
/// Presupuesto de una orden. Solo existe después del diagnóstico (ORD-002).
/// </summary>
public class OrderTrackingBudgetDto
{
    public string? TechnicalDiagnosis { get; set; }

    public decimal LaborCost { get; set; }

    public decimal PartsCost { get; set; }

    public decimal TotalCost { get; set; }
}

/// <summary>
/// Evento de la bitácora de una orden.
/// </summary>
public class OrderTrackingLogDto
{
    /// <summary>
    /// Nombre del estado en español, como en la ERS.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Código del estado (por ejemplo InDiagnosis).
    /// </summary>
    public string StatusCode { get; set; } = string.Empty;

    public string Comment { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora del evento, en UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// Seguimiento completo de una orden (ORD-005).
/// </summary>
public class OrderTrackingDto
{
    public int Id { get; set; }

    public int OrderNumber { get; set; }

    /// <summary>
    /// Estado actual en español.
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Código del estado actual (por ejemplo InDiagnosis).
    /// </summary>
    public string StatusCode { get; set; } = string.Empty;

    public string EquipmentType { get; set; } = string.Empty;

    public string BrandModel { get; set; } = string.Empty;

    public string? SerialNumber { get; set; }

    public string ReportedFault { get; set; } = string.Empty;

    /// <summary>
    /// Presupuesto de la orden. Es nulo si aún no existe.
    /// </summary>
    public OrderTrackingBudgetDto? Budget { get; set; }

    /// <summary>
    /// Bitácora ordenada del evento más reciente al más antiguo.
    /// </summary>
    public List<OrderTrackingLogDto> Logs { get; set; } = [];
}