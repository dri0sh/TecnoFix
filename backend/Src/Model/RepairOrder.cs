namespace TecnoFix.Src.Model;

/// <summary>
/// Orden de reparación de un equipo (ORD-001).
/// Las demás tarjetas agregan datos a esta misma entidad: diagnóstico y costos (ORD-002)
/// y datos de entrega (ORD-006).
/// </summary>
public class RepairOrder
{
    /// <summary>
    /// Identificador interno de la orden (llave primaria).
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Número de orden visible para el usuario: único y correlativo (1, 2, 3, ...).
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// Cliente dueño del equipo, seleccionado del listado de clientes.
    /// </summary>
    public int ClientId { get; set; }
    public User Client { get; set; } = default!;

    /// <summary>
    /// Tipo de equipo, tomado del catálogo de ADM-001.
    /// </summary>
    public int EquipmentTypeId { get; set; }
    public EquipmentType EquipmentType { get; set; } = default!;

    /// <summary>
    /// Marca y modelo del equipo (obligatorio). La tarjeta lo define como un solo campo.
    /// </summary>
    public string BrandModel { get; set; } = string.Empty;

    /// <summary>
    /// Número de serie del equipo (opcional).
    /// </summary>
    public string? SerialNumber { get; set; }

    /// <summary>
    /// Descripción de la falla reportada por el cliente (obligatorio).
    /// </summary>
    public string ReportedFault { get; set; } = string.Empty;

    /// <summary>
    /// Accesorios entregados junto con el equipo (opcional).
    /// </summary>
    public string? Accessories { get; set; }

    /// <summary>
    /// Estado actual de la orden. Al registrarla queda en «Recibida».
    /// </summary>
    public OrderStatus Status { get; set; } = OrderStatus.Received;

    /// <summary>
    /// Fecha y hora de recepción del equipo, en UTC.
    /// </summary>
    public DateTime ReceivedAt { get; set; }

    /// <summary>
    /// Usuario (técnico o administrador) que registró la orden.
    /// </summary>
    public int RegisteredById { get; set; }
    public User RegisteredBy { get; set; } = default!;

    /// <summary>
    /// Bitácora de la orden: un evento por cada cambio de estado.
    /// </summary>
    public ICollection<OrderLog> Logs { get; set; } = [];
}