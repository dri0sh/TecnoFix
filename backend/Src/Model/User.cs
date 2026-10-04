namespace TecnoFix.Src.Model;

public class Usuario
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Rut { get; set; } = string.Empty;

    public string Telefono { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public int IdRol { get; set; }

    public Rol? RolUsuario { get; set; }
}