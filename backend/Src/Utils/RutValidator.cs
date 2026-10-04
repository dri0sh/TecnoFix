using System.Text.RegularExpressions;

namespace TecnoFix.Src.Utils
{
    /// <summary>
    /// Contiene métodos para validar y normalizar RUT chilenos.
    /// </summary>
    public static class ValidatorRut
    {
        /// <summary>
        /// Valida el formato y el dígito verificador de un RUT.
        /// Retorna el RUT normalizado si es válido.
        /// Retorna null si el RUT no es válido.
        /// </summary>
        public static string? ValidarRut(string rutCrudo)
        {
            // El RUT debe ingresarse sin puntos ni guion.
            if (string.IsNullOrWhiteSpace(rutCrudo))
                return null;

            if (rutCrudo.Contains('.') || rutCrudo.Contains('-'))
                return null;

            // El RUT debe contener solamente números y una K
            // como posible dígito verificador.
            if (!Regex.IsMatch(rutCrudo, @"^\d+[0-9Kk]$"))
                return null;

            var rut = rutCrudo.ToUpperInvariant();

            // Separamos el cuerpo del dígito verificador.
            var cuerpo = rut[..^1];
            var dvIngresado = rut[^1];

            if (!long.TryParse(cuerpo, out _))
                return null;

            int suma = 0;
            int multiplicador = 2;

            // Calculamos el dígito verificador según el algoritmo chileno.
            for (int i = cuerpo.Length - 1; i >= 0; i--)
            {
                suma += (cuerpo[i] - '0') * multiplicador;

                multiplicador++;

                if (multiplicador > 7)
                    multiplicador = 2;
            }

            int resto = 11 - (suma % 11);

            char dvCalculado = resto switch
            {
                11 => '0',
                10 => 'K',
                _ => (char)('0' + resto)
            };

            if (dvCalculado != dvIngresado)
                return null;

            return rut;
        }
    }
}