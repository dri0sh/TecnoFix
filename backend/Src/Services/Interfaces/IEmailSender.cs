namespace TecnoFix.Src.Services.Interfaces;

/// <summary>
/// Define las operaciones relacionadas con el envío de correos electrónicos.
/// </summary>
public interface IEmailSender
{
    /// <summary>
    /// Envía un correo electrónico a la dirección de destino especificada
    /// con el asunto y el cuerpo HTML proporcionados.
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
    Task SendEmailAsync(string recipient, string subject, string htmlBody);
}