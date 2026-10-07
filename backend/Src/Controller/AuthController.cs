using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Controller;

/// <summary>
/// Controlador encargado de las operaciones de autenticación,
/// registro de usuarios y gestión de credenciales.
/// </summary>
/// <param name="authService">Servicio de autenticación inyectado.</param>
[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    /// <summary>
    /// Inicia sesión con las credenciales proporcionadas.
    /// </summary>
    /// <param name="request">Credenciales del usuario.</param>
    /// <returns>Información básica del usuario autenticado.</returns>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var resultado = await _authService.LoginAsync(request);

        if (!resultado.Exito)
        {
            return Unauthorized(new
            {
                mensaje = resultado.Mensaje
            });
        }

        Response.Cookies.Append("access_token", resultado.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });

        return Ok(new
        {
            mensaje = resultado.Mensaje,
            correo = resultado.Correo,
            rol = resultado.Rol
        });
    }

    /// <summary>
    /// Registra a un nuevo cliente en el sistema.
    /// </summary>
    /// <param name="request">Datos del nuevo cliente.</param>
    /// <returns>Resultado del registro.</returns>
    [HttpPost("register-cliente")]
    public async Task<ActionResult<RegistrarClienteResponseDto>> RegistrarCliente(
        [FromBody] RegistrarClienteRequestDto request)
    {
        var resultado = await _authService.RegistrarClienteAsync(request);

        if (resultado is null)
        {
            return BadRequest(new
            {
                mensaje = "Error al registrar el cliente"
            });
        }

        if (resultado.Mensaje.Contains("ya se encuentra registrado"))
        {
            return Conflict(resultado);
        }

        if (resultado.Mensaje.Contains("RUT"))
        {
            return BadRequest(resultado);
        }

        if (resultado.Mensaje.Contains("falló el envío del correo"))
        {
            return BadRequest(resultado);
        }

        return Ok(resultado);
    }

    /// <summary>
    /// Registra a un nuevo técnico en el sistema.
    /// </summary>
    /// <param name="dto">Datos del nuevo técnico.</param>
    /// <returns>Resultado del registro.</returns>
    [HttpPost("register-tecnico")]
    //[Authorize(Roles = "Administrador")]
    public async Task<IActionResult> RegisterTecnico(
        [FromBody] TecnicoCreateDto dto)
    {
        try
        {
            var resultado = await _authService.RegisterTecnicoAsync(dto);

            return Ok(new
            {
                mensaje = resultado
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                mensaje = ex.Message
            });
        }
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado de la operación.</returns>
    [Authorize]
    [HttpPost("cambiar-password")]
    public async Task<ActionResult<CambiarPasswordResponseDto>> CambiarPassword(
        [FromBody] CambiarPasswordRequestDto request)
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized(new
            {
                mensaje = "No se pudo identificar al usuario autenticado"
            });
        }

        var resultado =
            await _authService.CambiarPasswordAsync(usuarioId, request);

        if (!resultado.Exito)
        {
            return BadRequest(new
            {
                mensaje = resultado.Mensaje
            });
        }

        Response.Cookies.Delete("access_token");

        return Ok(resultado);
    }

    /// <summary>
    /// Cierra la sesión del usuario eliminando la cookie de autenticación.
    /// </summary>
    /// <returns>Resultado de la operación.</returns>
    [HttpHead("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token");

        return Ok(new{mensaje = "Sesión cerrada"});
    }
}
