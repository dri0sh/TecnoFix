using SendGrid;
using SendGrid.Helpers.Mail;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Services;

/// <summary>
/// Implementa el servicio de envío de correos electrónicos utilizando SendGrid.
/// </summary>
/// <param name="configuration">
/// Configuración de la aplicación.
/// </param>
public class SendGridEmailSender(IConfiguration configuration) : IEmailSender
{
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Envía un correo electrónico utilizando SendGrid.
    /// </summary>
    /// <param name="recipient">
    /// Dirección de correo electrónico del destinatario.
    /// </param>
    /// <param name="subject">
    /// Asunto del correo electrónico.
    /// </param>
    /// <param name="htmlBody">
    /// Cuerpo del correo electrónico en formato HTML.
    /// </param>
    /// <returns>
    /// Una tarea que representa la operación de envío del correo.
    /// </returns>
    public async Task SendEmailAsync(
        string recipient,
        string subject,
        string htmlBody)
    {
        var apiKey = _configuration["SendGrid:ApiKey"] ?? throw new InvalidOperationException("Falta configurar SendGrid:ApiKey");

        var fromEmail = _configuration["SendGrid:FromEmail"] ?? throw new InvalidOperationException("Falta configurar SendGrid:FromEmail");

        var fromName = _configuration["SendGrid:FromName"] ?? "TecnoFix";

        var client = new SendGridClient(apiKey);

        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(recipient);

        var message = MailHelper.CreateSingleEmail(
            from,
            to,
            subject,
            plainTextContent: true ? htmlBody : null,
            htmlContent: htmlBody);

        var response = await client.SendEmailAsync(message);

        if ((int)response.StatusCode >= 400)
        {
            var errorBody = await response.Body.ReadAsStringAsync();

            throw new InvalidOperationException($"SendGrid devolvió {(int)response.StatusCode}: {errorBody}");
        }
    }
}