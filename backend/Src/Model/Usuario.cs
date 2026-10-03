namespace TecnoFix.Src.Model;

/// <summary>
/// Representa un usuario en el sistema TecnoFix.
/// </summary>
public class Usuario
{
    /// <summary>
    /// Identificador único del usuario.
    /// </summary>
    public int Id { get; set; }
    /// <summary>
    /// Nombre y apellidos del usuario.
    /// </summary>
    public string Nombre { get; set; } = string.Empty;
    /// <summary>
    /// Correo electrónico utilizado para iniciar sesión.
    /// </summary>
    public string Correo { get; set; } = string.Empty;
    /// <summary>
    /// Rol del usuario.
    /// </summary>
    public string Rut { get; set; } = string.Empty;
    /// <summary>
    /// Número de teléfono del usuario.
    /// </summary>
    public string Telefono { get; set; } = string.Empty;
    /// <summary>
    /// Hash de la contraseña del usuario.
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;
    /// <summary>
    /// Identificador del rol asociado al usuario.
    /// </summary>
    public int IdRol { get; set; }
    /// <summary>
    /// Rol asociado al usuario.
    /// </summary>
    public Rol? RolUsuario { get; set; }
}