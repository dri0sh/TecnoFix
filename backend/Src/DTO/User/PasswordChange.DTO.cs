using System.ComponentModel.DataAnnotations;

namespace TecnoFix.Src.DTO.User;

/// <summary>
/// Representa los datos necesarios para cambiar la contraseña de un usuario.
/// </summary>
public class PasswordChangeRequestDto
{
    /// <summary>
    /// La contraseña actual del usuario.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo de la contraseña actual.")]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// La nueva contraseña que el usuario desea establecer.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo de la nueva contraseña.")]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>
    /// Confirmación de la nueva contraseña para asegurar que el usuario la ingresó correctamente.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo de la confirmación de la nueva contraseña.")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Representa el resultado de una operación de cambio de contraseña.
/// </summary>
public class PasswordChangeResponseDto
{
    /// <summary>
    /// Indica si la operación se realizó correctamente.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Mensaje correspondiente al resultado de la operación.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}