namespace TecnoFix.Src.DTO.Order;

/// <summary>
/// Datos para registrar una orden de reparación (ORD-001).
/// ClientId y EquipmentTypeId son nullables para detectar cuando no se seleccionó nada
/// y responder con «Debe completar el campo ...». Los textos también son nullables para que
/// ASP.NET no los trate como obligatorios (respondería en inglés antes de llegar al servicio).
/// </summary>
public class RepairOrderCreateRequestDto
{
    /// <summary>
    /// Cliente seleccionado del listado (obligatorio).
    /// </summary>
    public int? ClientId { get; set; }

    /// <summary>
    /// Tipo de equipo seleccionado del catálogo (obligatorio).
    /// </summary>
    public int? EquipmentTypeId { get; set; }

    /// <summary>
    /// Marca y modelo (obligatorio).
    /// </summary>
    public string? BrandModel { get; set; }

    /// <summary>
    /// Número de serie (opcional).
    /// </summary>
    public string? SerialNumber { get; set; }

    /// <summary>
    /// Descripción de la falla reportada (obligatorio).
    /// </summary>
    public string? ReportedFault { get; set; }

    /// <summary>
    /// Accesorios entregados (opcional).
    /// </summary>
    public string? Accessories { get; set; }
}

/// <summary>
/// Resultado del registro de una orden.
/// </summary>
public class RepairOrderCreateResponseDto
{
    /// <summary>
    /// Indica si la orden quedó registrada.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Mensaje general del resultado.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Errores de validación por campo (clave: clientId, equipmentTypeId, brandModel, ...).
    /// </summary>
    public Dictionary<string, string> FieldErrors { get; set; } = [];

    /// <summary>
    /// Número de orden generado (solo si Success es true).
    /// </summary>
    public int OrderNumber { get; set; }

    /// <summary>
    /// Nombre del estado asignado, según la ERS («Recibida»).
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// Fecha y hora de recepción, en UTC.
    /// </summary>
    public DateTime ReceivedAt { get; set; }
}

/// <summary>
/// Opción de un listado desplegable (cliente o tipo de equipo).
/// </summary>
/// <param name="Id">Identificador que se envía al registrar la orden.</param>
/// <param name="Label">Texto que ve el usuario.</param>
public record SelectOptionDto(int Id, string Label);

/// <summary>
/// Listados que necesita el formulario de registrar orden.
/// </summary>
public class RepairOrderFormOptionsDto
{
    /// <summary>
    /// Clientes registrados, para seleccionar el dueño del equipo.
    /// </summary>
    public List<SelectOptionDto> Clients { get; set; } = [];

    /// <summary>
    /// Tipos de equipo habilitados (ADM-001).
    /// </summary>
    public List<SelectOptionDto> EquipmentTypes { get; set; } = [];
}