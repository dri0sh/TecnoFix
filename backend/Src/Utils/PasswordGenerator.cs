using System.Security.Cryptography;

namespace TecnoFix.Src.Utils;

/// <summary>
/// Utilitario para la generacion criptograficamente segura de contrasenias provisionales.
/// </summary>
public static class PasswordGenerator
{
    /// <summary>
    /// Genera una contrasenia aleatoria segura que incluye caracteres alfanumericos.
    /// </summary>
    /// <param name="longitud">Cantidad de caracteres de la contrasenia generada.</param>
    /// <returns>Cadena con la contraseña provisional.</returns>
    public static string GenerateRandomPassword(int longitud = 10)
    {
        const string caracteresValidos = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var arregloChars = new char[longitud];
        var bytesAleatorios = new byte[longitud];

        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytesAleatorios);
        }

        for (int i = 0; i < longitud; i++)
        {
            arregloChars[i] = caracteresValidos[bytesAleatorios[i] % caracteresValidos.Length];
        }

        return new string(arregloChars);
    }
}