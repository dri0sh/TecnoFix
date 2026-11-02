namespace TecnoFix.Src.DTO.User;

/// <summary>
/// Datos que el administrador ingresa para registrar un técnico (USU-003).
/// La tarjeta solo pide nombre y apellidos, correo electrónico y especialidad.
/// Las propiedades son nullables a propósito: con Nullable activado, ASP.NET trata
/// los string no nullables como obligatorios y respondería con su propio mensaje
/// en inglés antes de llegar al servicio, donde están los mensajes de la ERS.
/// </summary>
public class TechnicianRegistrationRequestDto
{
    /// <summary>
    /// Nombre y apellidos del técnico.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Correo electrónico al que se envía la contraseña temporal.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Especialidad del técnico. Debe ser una de las definidas en TechnicianSpecialties.
    /// </summary>
    public string? Specialty { get; set; }
}

/// <summary>
/// Resultado del registro de un técnico.
/// </summary>
public class TechnicianRegistrationResponseDto
{
    /// <summary>
    /// Indica si el técnico quedó registrado.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Mensaje general del resultado.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Errores de validación por campo (clave: name, email o specialty).
    /// Permite que el frontend muestre cada error bajo su campo.
    /// </summary>
    public Dictionary<string, string> FieldErrors { get; set; } = [];

    /// <summary>
    /// Indica que el error corresponde a un correo ya registrado (se responde 409 Conflict).
    /// </summary>
    public bool IsDuplicateEmail { get; set; }
}