using TecnoFix.Src.DTO.Usuario;

namespace TecnoFix.Src.Services.Interfaces;

/// <summary>
/// Define las operaciones relacionadas con la autenticación y gestión de credenciales.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="usuarioId">Identificador del usuario autenticado.</param>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Mensaje indicando el resultado de la operación.</returns>
    Task<CambiarPasswordResponseDto> CambiarPasswordAsync(int usuarioId, CambiarPasswordRequestDto request);
}