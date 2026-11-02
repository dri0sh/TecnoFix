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
    /// RUT del usuario. Solo lo ingresa el cliente (USU-002);
    /// el técnico y el administrador no lo tienen.
    /// </summary>
    public string? Rut { get; set; }

    /// <summary>
    /// Teléfono de contacto. Solo lo ingresa el cliente (USU-002).
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Especialidad del técnico (USU-003). Es nula para clientes y administradores.
    /// </summary>
    public string? Specialty { get; set; }

    /// <summary>
    /// Indica si el usuario está habilitado.
    /// El técnico queda habilitado por defecto al registrarse (USU-003).
    /// </summary>
    public bool IsEnabled { get; set; } = true;

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