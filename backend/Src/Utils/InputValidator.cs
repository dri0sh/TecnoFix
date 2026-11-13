using System.Text.RegularExpressions;

namespace TecnoFix.Src.Utils;

/// <summary>
/// Validaciones de formato reutilizables en el backend.
/// El backend valida siempre los datos, de forma independiente al frontend,
/// porque una petición se puede enviar sin pasar por el formulario (por ejemplo, con Postman).
/// </summary>
public static class InputValidator
{
    /// <summary>
    /// Formato de correo: texto@dominio.extensión (la extensión con al menos 2 caracteres).
    /// Es la misma expresión que usa el frontend en iniciar sesión.
    /// </summary>
    private static readonly Regex EMAIL_REGEX =
        new(@"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", RegexOptions.Compiled);

    /// <summary>
    /// Solo letras (incluye tildes, ñ y ü) y espacios.
    /// </summary>
    private static readonly Regex PERSON_NAME_REGEX =
        new(@"^[\p{L} ]+$", RegexOptions.Compiled);

    /// <summary>
    /// Indica si el correo tiene un formato válido.
    /// </summary>
    /// <param name="email">Correo sin espacios al inicio ni al final.</param>
    public static bool IsValidEmail(string email) => EMAIL_REGEX.IsMatch(email);

    /// <summary>
    /// Indica si el nombre contiene solo letras y espacios.
    /// </summary>
    /// <param name="name">Nombre sin espacios al inicio ni al final.</param>
    public static bool IsValidPersonName(string name) => PERSON_NAME_REGEX.IsMatch(name);

    /// <summary>
    /// Construye el mensaje de campo obligatorio definido en la ERS.
    /// </summary>
    /// <param name="fieldLabel">Nombre del campo tal como lo ve el usuario.</param>
    /// <returns>Por ejemplo: «Debe completar el campo Especialidad».</returns>
    public static string RequiredFieldMessage(string fieldLabel) => $"Debe completar el campo {fieldLabel}";
}