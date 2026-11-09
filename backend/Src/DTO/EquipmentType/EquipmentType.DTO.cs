namespace TecnoFix.Src.DTO.EquipmentType;

/// <summary>
/// Datos necesarios para registrar o editar un tipo de equipo.
/// </summary>
public class EquipmentTypeRequestDto
{
    /// <summary>
    /// Nombre del tipo de equipo.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Descripción opcional del tipo de equipo.
    /// </summary>
    public string? Description { get; set; }
}

/// <summary>
/// Representa un tipo de equipo del catálogo.
/// </summary>
public class EquipmentTypeDto
{
    /// <summary>
    /// Identificador del tipo de equipo.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Nombre del tipo de equipo.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Descripción del tipo de equipo.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Indica si el tipo de equipo está habilitado en el catálogo.
    /// </summary>
    public bool IsEnabled { get; set; }
}

/// <summary>
/// Datos utilizados para habilitar o deshabilitar un tipo de equipo.
/// </summary>
public class EquipmentTypeStatusRequestDto
{
    /// <summary>
    /// Indica si el tipo de equipo debe quedar habilitado.
    /// </summary>
    public bool IsEnabled { get; set; }
}

/// <summary>
/// Resultado de una operación de gestión del catálogo de tipos de equipo.
/// </summary>
public class EquipmentTypeOperationResponseDto
{
    /// <summary>
    /// Indica si la operación fue exitosa.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Mensaje general de la operación.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Errores asociados a campos específicos del formulario.
    /// </summary>
    public Dictionary<string, string> FieldErrors { get; set; } = [];

    /// <summary>
    /// Indica si la operación falló porque el nombre ya existe.
    /// </summary>
    public bool IsDuplicateName { get; set; }

    /// <summary>
    /// Indica si el tipo no existe en el catálogo.
    /// </summary>
    public bool IsNotFound { get; set; }

    /// <summary>
    /// Indica si no es posible deshabilitar el tipo porque tiene órdenes en proceso.
    /// </summary>
    public bool HasOrdersInProgress { get; set; }

    /// <summary>
    /// Tipo de equipo creado o actualizado.
    /// </summary>
    public EquipmentTypeDto? EquipmentType { get; set; }
}