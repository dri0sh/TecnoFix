using SendGrid;
using SendGrid.Helpers.Mail;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Services;

/// <summary>
/// Implementación del servicio de mensajería electrónica mediante el proveedor externo Twilio SendGrid.
/// </summary>
/// <param name="configuration">Acceso a las variables de configuración del sistema.</param>
public class EmailService(IConfiguration configuration) : IEmailService
{
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Despacha el correo electrónico a través de SendGrid utilizando las credenciales locales configuradas.
    /// </summary>
    /// <param name="destinatario">Dirección de correo electrónico de destino.</param>
    /// <param name="asunto">Asunto del mensaje.</param>
    /// <param name="contenido">Cuerpo del correo en texto plano o HTML.</param>
    public async Task SendEmailAsync(string destinatario, string asunto, string contenido)
    {
        var apiKey = _configuration["SendGrid:ApiKey"];
        var fromEmail = _configuration["SendGrid:FromEmail"];
        var fromName = _configuration["SendGrid:FromName"] ?? "TecnoFix Soporte";

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(destinatario);
        var mensaje = MailHelper.CreateSingleEmail(from, to, asunto, contenido, contenido);

        var respuesta = await client.SendEmailAsync(mensaje);
        if (!respuesta.IsSuccessStatusCode)
        {
            var detalleError = await respuesta.Body.ReadAsStringAsync();
            throw new Exception($"Error al enviar correo con SendGrid: {respuesta.StatusCode} - {detalleError}");
        }
    }
}