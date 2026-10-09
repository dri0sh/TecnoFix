using System.ComponentModel.DataAnnotations;

namespace TecnoFix.Src.DTO.User;

/// <summary>
/// Representa la solicitud de registro de un nuevo cliente.
/// </summary>
public class ClientRegistrationRequestDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rut es obligatorio.")]
    public string Rut { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    public string PhoneNumber { get; set; } = string.Empty;
}

/// <summary>
/// Representa la respuesta de un intento de registro de cliente.
/// </summary>
public class ClientRegistrationResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Message { get; set; } = "Cliente registrado. Revisa tu correo para la contraseña temporal.";
}