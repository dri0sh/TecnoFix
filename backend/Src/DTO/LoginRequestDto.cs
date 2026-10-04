using System.ComponentModel.DataAnnotations;

namespace TecnoFix.Src.DTO.Usuario;

/// <summary>
/// Representa la solicitud de inicio de sesión de un usuario.
/// </summary>
public class LoginRequestDto
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    public string Password { get; set; } = string.Empty;
}