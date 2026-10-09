namespace TecnoFix.Src.Model;

/// <summary>
/// Representa un usuario en el sistema TecnoFix.
/// </summary>
public class User
{
    /// <summary>
    /// Identificador único del usuario.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Nombre y apellidos del usuario.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Correo electrónico utilizado para iniciar sesión.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Rol Único Tributario (RUT) del usuario.
    /// </summary>
    public string Rut { get; set; } = string.Empty;

    /// <summary>
    /// Número de teléfono del usuario.
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Hash de la contraseña del usuario.
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Identificador del rol asociado al usuario.
    /// </summary>
    public int RoleId { get; set; }

    /// <summary>
    /// Rol asociado al usuario.
    /// </summary>
    public Role? Role { get; set; }
}