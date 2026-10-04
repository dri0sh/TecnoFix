using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;

namespace TecnoFix.Src.Controller;

/// <summary>
/// Controlador encargado de las operaciones de autenticación
/// y gestión de credenciales.
/// </summary>
/// <param name="authService">Servicio de autenticación</param>
[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // Servicio de autenticación inyectado en el controlador
    private readonly IAuthService _authService = authService;

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

    /// <summary>
    /// Inicia sesión con correo y contraseña (USU-001).
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var resultado = await _authService.LoginAsync(request);

        if (!resultado.Exito)
        {
            return Unauthorized(new { mensaje = resultado.Mensaje });
        }

        // El token se guarda en una cookie HttpOnly, igual que la que borra CambiarPassword
        Response.Cookies.Append("access_token", resultado.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });

        // No se devuelve el token en el body
        return Ok(new { mensaje = resultado.Mensaje, correo = resultado.Correo, rol = resultado.Rol });
    }

}