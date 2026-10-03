namespace TecnoFix.Src.Model;

/// <summary>
/// Representa un rol en el sistema TecnoFix.
/// </summary>
public class Rol
{
    /// <summary>
    /// Identificador único del rol.
    /// </summary>
    public int Id { get; set; }
    /// <summary>
    /// Nombre del rol. 
    /// </summary>
    public string Nombre { get; set; } = string.Empty;
    /// <summary>
    /// lista de usuarios que pertenecen a este rol    
    /// </summary>
    public ICollection<Usuario> Usuarios { get; set; } = [];
}