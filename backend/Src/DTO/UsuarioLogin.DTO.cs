using System.ComponentModel.DataAnnotations;

namespace TecnoFix.Src.DTO.Usuario;

/// <summary>
/// Representa la solicitud para iniciar sesión.
/// </summary>
public class LoginRequestDto
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    public string Password { get; set; } = string.Empty;
}

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