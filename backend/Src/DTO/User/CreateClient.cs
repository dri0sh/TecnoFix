
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace TecnoFix.Src.DTO.User;

/// <summary>
/// Representa la solicitud de registro de un nuevo cliente.
/// </summary>
public class ClientRegistrationRequestDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [RegularExpression(@"^[\p{L}\s]+$", ErrorMessage = "El nombre solo puede contener letras y espacios.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo electrónico no tiene un formato válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rut es obligatorio.")]
    [CustomValidation(typeof(ClientRegistrationRequestDto), nameof(ValidateRut))]
    public string Rut { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "El teléfono debe contener exactamente 9 números.")]
    public string PhoneNumber { get; set; } = string.Empty;

    public static ValidationResult? ValidateRut(string? rut)
    {
        if (string.IsNullOrWhiteSpace(rut))
            return ValidationResult.Success; // Required valida si está vacío.

        string cleanRut = rut.Replace(".", "").Replace("-", "").Trim();

        if (!Regex.IsMatch(cleanRut, @"^\d{7,8}[0-9kK]$"))
            return new ValidationResult("El RUT debe tener un formato válido.");

        string body = cleanRut[..^1];
        string verifier = cleanRut[^1].ToString().ToUpper();

        int sum = 0;
        int multiplier = 2;

        for (int i = body.Length - 1; i >= 0; i--)
        {
            sum += int.Parse(body[i].ToString()) * multiplier;
            multiplier = multiplier == 7 ? 2 : multiplier + 1;
        }

        int result = 11 - (sum % 11);

        string expectedVerifier = result switch
        {
            11 => "0",
            10 => "K",
            _ => result.ToString()
        };

        return verifier == expectedVerifier
            ? ValidationResult.Success
            : new ValidationResult("El RUT ingresado no es válido.");
    }
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
