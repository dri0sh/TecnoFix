namespace TecnoFix.Src.DTO.Usuario;

/// <summary>
/// DTO utilizado para transportar los datos requeridos en el registro administrativo de un tecnico.
/// </summary>
public class TecnicoCreateDto
{
    /// <summary>
    /// Nombre completo del tecnico.
    /// </summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Rol Unico Tributario (RUT) del tecnico.
    /// </summary>
    public string Rut { get; set; } = string.Empty;

    /// <summary>
    /// Correo electronico institucional o personal donde se enviaran las credenciales.
    /// </summary>
    public string Correo { get; set; } = string.Empty;

    /// <summary>
    /// Numero telefonico de contacto.
    /// </summary>
    public string Telefono { get; set; } = string.Empty;
}