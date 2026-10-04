using TecnoFix.Src.DTO.Usuario;
namespace TecnoFix.Src.Services;
/// <summary>
/// Define la interfaz para los servicios de autenticación y registro de usuarios.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Intenta autenticar a un usuario con las credenciales proporcionadas y 
    /// devuelve un token JWT si la autenticación es exitosa.
    /// </summary>
    /// <param name="request">LoginRequestDto como request para envio de los datos </param>
    /// <returns></returns>
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
    /// <summary>
    /// Registra un nuevo cliente en el sistema y devuelve información sobre el cliente registrado.
    /// </summary>
    /// <param name="request">RegistrarClienteRequestDto como request para envio de los datos </param>
    /// <returns></returns>
    Task<RegistrarClienteResponseDto> RegistrarClienteAsync(RegistrarClienteRequestDto request);
}