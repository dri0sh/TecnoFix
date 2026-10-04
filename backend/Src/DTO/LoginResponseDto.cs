namespace TecnoFix.Src.DTO.Usuario;

/// <summary>
/// Representa la respuesta del inicio de sesión.
/// </summary>
public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Rol { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
}