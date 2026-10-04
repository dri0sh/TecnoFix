// Services/SendGridEmailSender.cs
using SendGrid;
using SendGrid.Helpers.Mail;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Services;
/// <summary>
/// Implementa el servicio de envío de correos electrónicos utilizando SendGrid.
/// </summary>
/// <param name="configuration"></param>
public class SendGridEmailSender(IConfiguration configuration) : IEmailSender
{
    private readonly IConfiguration _configuration = configuration;

    public async Task SendEmailAsync(string destino, string asunto, string cuerpoHtml)
    {
        var apiKey = _configuration["SendGrid:ApiKey"]
            ?? throw new InvalidOperationException("Falta configurar SendGrid:ApiKey");
        var fromEmail = _configuration["SendGrid:FromEmail"]
            ?? throw new InvalidOperationException("Falta configurar SendGrid:FromEmail");
        var fromName = _configuration["SendGrid:FromName"] ?? "TecnoFix";

        var client = new SendGridClient(apiKey);
        var from = new EmailAddress(fromEmail, fromName);
        var to = new EmailAddress(destino);

        var mensaje = MailHelper.CreateSingleEmail(
            from, to, asunto,
            plainTextContent: true ? cuerpoHtml : null,
            htmlContent: cuerpoHtml);

        var respuesta = await client.SendEmailAsync(mensaje);

        if ((int)respuesta.StatusCode >= 400)
        {
            var cuerpoError = await respuesta.Body.ReadAsStringAsync();
            throw new InvalidOperationException($"SendGrid devolvió {(int)respuesta.StatusCode}: {cuerpoError}");
        }
    }
}