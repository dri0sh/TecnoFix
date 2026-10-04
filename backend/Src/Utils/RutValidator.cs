using System.Text.RegularExpressions;

namespace TecnoFix.Src.Utils;
/// <summary>
/// Clase estática para validar el RUT chileno.
/// </summary>
public static class ValidatorRut
{
    /// <summary>
    /// Valida un RUT chileno crudo y devuelve el RUT limpio si es válido, o null si no lo es.
    /// </summary>
    /// <param name="rutCrudo">El RUT chileno crudo a validar.</param>
    /// <returns>El RUT limpio si es válido, o null si no lo es.</returns>
    public static string? ValidarRut(string rutCrudo)
    {
        // Elimina todos los caracteres que no sean dígitos o 'k'/'K' y convierte a mayúsculas
        // Si el RUT limpio tiene menos de 2 caracteres, no es válido
        var limpio = Regex.Replace(rutCrudo, "[^0-9kK]", "").ToUpperInvariant();
        if (limpio.Length < 2) return null;
        // Separa el cuerpo del RUT y el dígito verificador (DV)
        var cuerpo = limpio[..^1];
        // Obtiene el dígito verificador ingresado
        var dvIngresado = limpio[^1];
        // Si el cuerpo no es un número válido, no es un RUT válido
        if (!long.TryParse(cuerpo, out _)) return null;
        // Calcula el dígito verificador esperado según el algoritmo del RUT chileno
        int suma = 0, multiplicador = 2;
        for (int i = cuerpo.Length - 1; i >= 0; i--)
        {
            suma += (cuerpo[i] - '0') * multiplicador;
            multiplicador = multiplicador == 7 ? 2 : multiplicador + 1;
        }
        // Calcula el dígito verificador esperado
        int resto = 11 - (suma % 11);
        // Determina el dígito verificador calculado según el resto
        char dvCalculado = resto switch { 
            11 => '0', 
            10 => 'K', 
            _ => (char)('0' + resto) 
        };
        // Compara el dígito verificador calculado con el ingresado 
        // y devuelve el RUT limpio si son iguales, o null si no lo son
        return dvCalculado == dvIngresado ? limpio : null;
    }
}