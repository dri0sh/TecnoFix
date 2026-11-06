using System.ComponentModel.DataAnnotations;

namespace TecnoFix.Src.DTO.Usuario;

/// <summary>
/// Representa la solicitud de registro de un nuevo cliente.
/// </summary>
public class RegistrarClienteRequestDto
{
    [Required(ErrorMessage = "Debe completar el campo Nombre y apellidos")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe completar el campo Correo electrónico")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe completar el campo RUT")]
    public string Rut { get; set; } = string.Empty;

    [Required(ErrorMessage = "Debe completar el campo Teléfono de contacto")]
    public string Telefono { get; set; } = string.Empty;
}

/// <summary>
/// Representa la respuesta de un intento de registro de cliente.
/// </summary>
public class RegistrarClienteResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Mensaje { get; set; } =
        "Cliente registrado. Revisa tu correo para la contraseña temporal.";
}