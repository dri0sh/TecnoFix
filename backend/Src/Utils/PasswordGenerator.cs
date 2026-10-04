namespace TecnoFix.Src.Utils;
/// <summary>
/// Clase estática para generar contraseñas aleatorias seguras.
/// </summary>
public static class PasswordGenerator
{
    /// Caracteres permitidos para la generación de contraseñas.
    const string Caracteres  = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    /// <summary>
    /// Genera una contraseña aleatoria de la longitud especificada utilizando caracteres permitidos.
    /// </summary>
    /// <param name="length">Tamaño de la contraseña a generar.</param>
    /// <returns>La contraseña generada.</returns>
    public static string GenerateRandomPassword(int length = 8)
    {    
        // Utiliza Random.Shared para obtener un generador de números aleatorios seguro y eficiente
        var random = Random.Shared;
        // Crea un arreglo de caracteres para almacenar la contraseña generada
        var chars = new char[length];
        for (int i = 0; i < length; i++)
        {
            chars[i] = Caracteres[random.Next(Caracteres.Length)];
        }
        return new string(chars);
    }
}