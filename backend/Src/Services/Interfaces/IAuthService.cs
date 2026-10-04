using TecnoFix.Src.DTO.Usuario;

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
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);

    /// <summary>
    /// Registra un nuevo cliente en el sistema.
    /// </summary>
    /// <param name="request">Datos del nuevo cliente.</param>
    /// <returns>Resultado del registro del cliente.</returns>
    Task<RegistrarClienteResponseDto> RegistrarClienteAsync(RegistrarClienteRequestDto request);

    /// <summary>
    /// Registra un nuevo técnico en el sistema, genera una contraseña provisoria
    /// y la envía por correo electrónico.
    /// </summary>
    /// <param name="dto">Datos del nuevo técnico.</param>
    /// <returns>Mensaje indicando el resultado de la operación.</returns>
    Task<string> RegisterTecnicoAsync(TecnicoCreateDto dto);

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="usuarioId">Identificador del usuario autenticado.</param>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado del cambio de contraseña.</returns>
    Task<CambiarPasswordResponseDto> CambiarPasswordAsync(int usuarioId, CambiarPasswordRequestDto request);
}