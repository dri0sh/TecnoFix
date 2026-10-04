namespace TecnoFix.Src.Model;

public class Rol
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public ICollection<Usuario> Usuarios { get; set; } = [];
}