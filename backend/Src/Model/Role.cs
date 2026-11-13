namespace TecnoFix.Src.Model;

/// <summary>
/// Representa un rol en el sistema TecnoFix.
/// </summary>
public class Role
{
    /// <summary>
    /// Identificador único del rol.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Nombre del rol.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Lista de usuarios que pertenecen a este rol.
    /// </summary>
    public ICollection<User> Users { get; set; } = [];
}