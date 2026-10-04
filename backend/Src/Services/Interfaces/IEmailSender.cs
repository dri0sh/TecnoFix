namespace TecnoFix.Src.Services.Interfaces;

public interface IEmailSender
{
    /// <summary>
    /// Envía un correo electrónico a la dirección de destino especificada con el asunto y el cuerpo HTML proporcionados.
    /// </summary>
    /// <param name="destino">La dirección de correo electrónico del destinatario.</param>
    /// <param name="asunto">El asunto del correo electrónico.</param>
    /// <param name="cuerpoHtml">El cuerpo del correo electrónico en formato HTML.</param>
    /// <returns></returns>
    Task SendEmailAsync(string destino, string asunto, string cuerpoHtml);
}