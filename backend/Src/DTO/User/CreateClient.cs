using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace TecnoFix.Src.DTO.User;

/// <summary>
/// Representa la solicitud de registro de un nuevo cliente.
/// </summary>
public class ClientRegistrationRequestDto
{
    [Required(ErrorMessage = "Debe completar el campo Nombre y apellidos.")]
    [RegularExpression(@"^[\p{L}\s]+$", ErrorMessage = "El nombre y apellidos solo pueden contener letras y espacios.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe completar el campo Correo electrónico.")]
    [EmailAddress(ErrorMessage = "El correo electrónico no tiene un formato válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe completar el campo RUT.")]
    [CustomValidation(typeof(ClientRegistrationRequestDto), nameof(ValidateRut))]
    public string Rut { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe completar el campo Teléfono.")]
    [RegularExpression(@"^\d{9}$", ErrorMessage = "El teléfono debe contener exactamente 9 números.")]
    public string PhoneNumber { get; set; } = string.Empty;

    public static ValidationResult? ValidateRut(string? rut)
{
    if (string.IsNullOrWhiteSpace(rut))
        return ValidationResult.Success;

    // No se permiten puntos ni guion.
    if (!Regex.IsMatch(rut, @"^\d{7,8}[0-9kK]$"))
    {
        return new ValidationResult(
            "El RUT debe ingresarse sin puntos ni guion (ej.: 12345670K)");
    }

    string body = rut[..^1];
    string verifier = rut[^1].ToString().ToUpper();

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
        : new ValidationResult("El RUT ingresado no es válido de acuerdo con el algoritmo chileno.");
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

    public string Message { get; set; } =
        "Cliente registrado. Revisa tu correo para la contraseña temporal.";

    public Dictionary<string, string> FieldErrors { get; set; } = new();
}
