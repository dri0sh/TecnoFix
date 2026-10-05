using System.ComponentModel.DataAnnotations;

namespace TecnoFix.Src.DTO.Usuario;

/// <summary>
/// Representa los datos necesarios para cambiar la contraseña de un usuario.
/// </summary>
public class CambiarPasswordRequestDto
{
    /// <summary>
    /// La contraseña actual del usuario.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo de la contraseña actual.")]
    public string PasswordActual { get; set; } = string.Empty;

    /// <summary>
    /// La nueva contraseña que el usuario desea establecer.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo de la nueva contraseña.")]
    public string PasswordNueva { get; set; } = string.Empty;

    /// <summary>
    /// Confirmación de la nueva contraseña para asegurar que el usuario la ingresó correctamente.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo de la confirmación de la nueva contraseña.")]
    public string ConfirmarPasswordNueva { get; set; } = string.Empty;
}

public class CambiarPasswordResponseDto
{
    /// <summary>
    /// Indica si la operación se realizó correctamente.
    /// </summary>
    public bool Exito { get; set; }

    /// <summary>
    /// Mensaje correspondiente al resultado de la operación.
    /// </summary>
    public string Mensaje { get; set; } = string.Empty;
}