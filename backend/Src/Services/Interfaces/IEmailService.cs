namespace TecnoFix.Src.Services.Interfaces;

/// <summary>
/// Define las operaciones del servicio de despacho y notificación por correo electrónico.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Envía un correo electrónico asíncrono a un destinatario específico.
    /// </summary>
    /// <param name="destinatario">Dirección de correo electrónico de destino.</param>
    /// <param name="asunto">Asunto del mensaje.</param>
    /// <param name="contenido">Cuerpo del mensaje en texto plano o HTML.</param>
    /// <returns>Tarea asíncrona que representa la operación.</returns>
    Task SendEmailAsync(string destinatario, string asunto, string contenido);
}