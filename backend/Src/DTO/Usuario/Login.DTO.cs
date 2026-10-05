namespace TecnoFix.Src.DTO.Usuario;

public class LoginRequestDto
{
    public string Correo { get; set; } = "";
    public string Contrasena { get; set; } = "";
}

public class LoginResponseDto
{
    public bool Exito { get; set; }
    public string Mensaje { get; set; } = "";
    public string Token { get; set; } = "";
    public string Correo { get; set; } = "";
    public string Rol { get; set; } = "";
}