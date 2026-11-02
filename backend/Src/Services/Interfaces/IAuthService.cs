using TecnoFix.Src.DTO.User;

namespace TecnoFix.Src.Services.Interfaces;

/// <summary>
/// Define las operaciones relacionadas con la autenticación,
/// registro de usuarios y gestión de credenciales.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Intenta autenticar a un usuario con las credenciales proporcionadas.
    /// </summary>
    /// <param name="request">Credenciales del usuario.</param>
    /// <returns>Información del resultado del inicio de sesión.</returns>
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);

    /// <summary>
    /// Registra un nuevo cliente en el sistema.
    /// </summary>
    /// <param name="request">Datos del nuevo cliente.</param>
    /// <returns>Resultado del registro del cliente.</returns>
    Task<ClientRegistrationResponseDto> RegisterClientAsync(ClientRegistrationRequestDto request);

    
    
    /// <summary>
    /// Registra un nuevo técnico (USU-003): valida los datos, genera una contraseña
    /// temporal y la envía al correo del técnico.
    /// </summary>
    /// <param name="request">Datos ingresados por el administrador.</param>
    /// <returns>Resultado del registro, con los errores por campo si los hay.</returns>
    Task<TechnicianRegistrationResponseDto> RegisterTechnicianAsync(TechnicianRegistrationRequestDto request);

    /// <summary>
    /// Entrega la lista de especialidades que se pueden asignar a un técnico.
    /// </summary>
    IReadOnlyList<string> GetTechnicianSpecialties();

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="userId">Identificador del usuario autenticado.</param>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado del cambio de contraseña.</returns>
    Task<PasswordChangeResponseDto> ChangePasswordAsync(int userId, PasswordChangeRequestDto request);
}
