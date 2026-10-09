using System.Text.RegularExpressions;

namespace TecnoFix.Src.Utils;

/// <summary>
/// Contiene métodos para validar y normalizar RUT chilenos.
/// </summary>
public static class RutValidator
{
    /// <summary>
    /// Valida el formato y el dígito verificador de un RUT.
    /// Retorna el RUT normalizado si es válido.
    /// Retorna null si el RUT no es válido.
    /// </summary>
    /// <param name="rawRut">RUT ingresado por el usuario.</param>
    /// <returns>
    /// RUT normalizado si es válido; de lo contrario, null.
    /// </returns>
    public static string? ValidateRut(string rawRut)
    {
        // El RUT debe ingresarse sin puntos ni guion.
        if (string.IsNullOrWhiteSpace(rawRut))
            return null;

        if (rawRut.Contains('.') || rawRut.Contains('-'))
            return null;

        // El RUT debe contener solamente números y una K
        // como posible dígito verificador.
        if (!Regex.IsMatch(rawRut, @"^\d+[0-9Kk]$"))
            return null;

        var rut = rawRut.ToUpperInvariant();

        // Separamos el cuerpo del dígito verificador.
        var body = rut[..^1];
        var providedCheckDigit = rut[^1];

        if (!long.TryParse(body, out _))
            return null;

        int sum = 0;
        int multiplier = 2;

        // Calculamos el dígito verificador según el algoritmo chileno.
        for (int i = body.Length - 1; i >= 0; i--)
        {
            sum += (body[i] - '0') * multiplier;

            multiplier++;

            if (multiplier > 7)
                multiplier = 2;
        }

        int remainder = 11 - (sum % 11);

        char calculatedCheckDigit = remainder switch
        {
            11 => '0',
            10 => 'K',
            _ => (char)('0' + remainder)
        };

        if (calculatedCheckDigit != providedCheckDigit)
            return null;

        return rut;
    }
}