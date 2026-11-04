namespace TecnoFix.Src.Model;

/// <summary>
/// Evento de la bitácora de una orden. Según la ERS, cada cambio de estado
/// queda registrado con fecha, hora y responsable.
/// </summary>
public class OrderLog
{
    /// <summary>
    /// Identificador único del evento.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Orden a la que pertenece el evento.
    /// </summary>
    public int RepairOrderId { get; set; }
    public RepairOrder RepairOrder { get; set; } = default!;

    /// <summary>
    /// Fecha y hora del evento, en UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Usuario responsable del cambio.
    /// </summary>
    public int ResponsibleId { get; set; }
    public User Responsible { get; set; } = default!;

    /// <summary>
    /// Estado anterior. Es nulo en el primer evento, porque la orden no tenía estado previo.
    /// </summary>
    public OrderStatus? PreviousStatus { get; set; }

    /// <summary>
    /// Estado al que pasó la orden.
    /// </summary>
    public OrderStatus NewStatus { get; set; }

    /// <summary>
    /// Comentario del evento (ORD-004 lo exige al cambiar de estado).
    /// </summary>
    public string Comment { get; set; } = string.Empty;
}