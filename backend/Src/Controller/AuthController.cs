using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;

namespace TecnoFix.Src.Controller;

/// <summary>
/// Controlador encargado de las operaciones de autenticación y gestión de credenciales.
/// </summary>
/// <param name="authService">Servicio de autenticación inyectado.</param>
[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    /// <summary>
    /// Registra a un nuevo técnico en el sistema. Requiere privilegios de Administrador.
    /// </summary>
    /// <param name="dto">Datos del nuevo técnico.</param>
    /// <returns>Resultado del registro.</returns>
    [HttpPost("register-tecnico")]
    //[Authorize(Roles = "Administrador")]
    public async Task<IActionResult> RegisterTecnico([FromBody] TecnicoCreateDto dto)
    {
        try
        {
            var resultado = await _authService.RegisterTecnicoAsync(dto);
            return Ok(new { mensaje = resultado });
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado de la operación.</returns>
    [Authorize]
    [HttpPost("cambiar-password")]
    public async Task<ActionResult<CambiarPasswordResponseDto>> CambiarPassword([FromBody] CambiarPasswordRequestDto request)
    {
        var usuarioIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (!int.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado"});
        }

        var resultado = await _authService.CambiarPasswordAsync(usuarioId, request);

        if (!resultado.Exito)
        {
            return BadRequest(new { mensaje = resultado.Mensaje });
        }

        Response.Cookies.Delete("access_token");

        return Ok(resultado);
    }
}