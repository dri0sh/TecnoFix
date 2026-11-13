using System.Security.Cryptography;

namespace TecnoFix.Src.Utils;

/// <summary>
/// Utilitario para la generación criptográficamente segura de contraseñas provisionales.
/// </summary>
public static class PasswordGenerator
{
    private const int MINIMUM_LENGTH = 8;

    private const string LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private const string DIGITS = "0123456789";

    private const string VALID_CHARACTERS = LETTERS + DIGITS;

    /// <summary>
    /// Genera una contraseña aleatoria segura que cumple con los requisitos
    /// mínimos de longitud, letras y números.
    /// </summary>
    /// <param name="length">
    /// Cantidad de caracteres de la contraseña generada.
    /// </param>
    /// <returns>Cadena con la contraseña provisional.</returns>
    /// <exception cref="ArgumentOutOfRangeException">
    /// Se produce cuando la longitud solicitada es menor a 8 caracteres.
    /// </exception>
    public static string GenerateRandomPassword(int length = 10)
    {
        if (length < MINIMUM_LENGTH)
        {
            throw new ArgumentOutOfRangeException(nameof(length), $"La contraseña debe tener al menos {MINIMUM_LENGTH} caracteres.");
        }

        var characters = new char[length];

        // Garantiza al menos una letra.
        characters[0] = LETTERS[RandomNumberGenerator.GetInt32(LETTERS.Length)];

        // Garantiza al menos un número.
        characters[1] = DIGITS[RandomNumberGenerator.GetInt32(DIGITS.Length)];

        // Completa el resto de la contraseña con caracteres alfanuméricos.
        for (int i = 2; i < length; i++)
        {
            characters[i] = VALID_CHARACTERS[RandomNumberGenerator.GetInt32(VALID_CHARACTERS.Length)];
        }

        // Mezcla los caracteres para evitar que la letra y el número siempre aparezcan en las primeras posiciones.
        for (int i = characters.Length - 1; i > 0; i--)
        {
            int randomIndex = RandomNumberGenerator.GetInt32(i + 1);

            (characters[i], characters[randomIndex]) = (characters[randomIndex], characters[i]);
        }

        return new string(characters);
    }
}