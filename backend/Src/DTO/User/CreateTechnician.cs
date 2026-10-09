namespace TecnoFix.Src.DTO.User;

/// <summary>
/// DTO utilizado para transportar los datos requeridos en el registro administrativo de un técnico.
/// </summary>
public class TechnicianRegistrationRequestDto
{
    /// <summary>
    /// Nombre completo del técnico.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Rol Único Tributario (RUT) del técnico.
    /// </summary>
    public string Rut { get; set; } = string.Empty;

    /// <summary>
    /// Correo electrónico institucional o personal donde se enviarán las credenciales.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Número telefónico de contacto.
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;
}