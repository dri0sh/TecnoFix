using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.User;
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
    public async Task<ActionResult<LoginResponseDto>> Login(
        [FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);

        if (!result.Success)
        {
            return Unauthorized(new
            {
                message = result.Message
            });
        }

        Response.Cookies.Append("access_token", result.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });

        return Ok(new
        {
            message = result.Message,
            email = result.Email,
            role = result.Role
        });
    }

    /// <summary>
    /// Registra a un nuevo cliente en el sistema.
    /// </summary>
    /// <param name="request">Datos del nuevo cliente.</param>
    /// <returns>Resultado del registro.</returns>
    [HttpPost("register-client")]
    public async Task<ActionResult<ClientRegistrationResponseDto>> RegisterClient(
        [FromBody] ClientRegistrationRequestDto request)
    {
        var result = await _authService.RegisterClientAsync(request);

        if (result is null)
        {
            return BadRequest(new
            {
                message = "Error al registrar el cliente"
            });
        }

        if (result.Message.Contains("ya se encuentra registrado"))
        {
            return Conflict(result);
        }

        if (result.Message.Contains("RUT"))
        {
            return BadRequest(result);
        }

        if (result.Message.Contains("falló el envío del correo"))
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Entrega las especialidades disponibles para el formulario de registrar técnico.
    /// </summary>
    /// <returns>Lista de especialidades.</returns>
    [Authorize(Roles = "Administrador")]
    [HttpGet("technician-specialties")]
    public async Task<ActionResult<List<string>>> GetTechnicianSpecialties()
    {
        return Ok(await _authService.GetTechnicianSpecialtiesAsync());
    }

    /// <summary>
    /// Agrega una nueva especialidad de técnico (USU-003). Solo el administrador puede hacerlo.
    /// </summary>
    /// <param name="request">Nombre de la nueva especialidad.</param>
    /// <returns>200 si se agregó, 400 si el nombre es inválido, 409 si ya existe.</returns>
    [Authorize(Roles = "Administrador")]
    [HttpPost("technician-specialties")]
    public async Task<IActionResult> AddSpecialty([FromBody] SpecialtyRequestDto request)
    {
        var result = await _authService.AddSpecialtyAsync(request);

        if (result.Success)
        {
            return Ok(new { message = result.Message, name = result.Name });
        }

        var errorBody = new { message = result.Message, fieldErrors = result.FieldErrors };

        return result.IsDuplicateName ? Conflict(errorBody) : BadRequest(errorBody);
    }

    /// <summary>
    /// Registra un nuevo técnico (USU-003). Solo el administrador puede hacerlo.
    /// </summary>
    /// <param name="request">Nombre y apellidos, correo electrónico y especialidad.</param>
    /// <returns>
    /// 200 si se registró, 400 si hay datos inválidos o falló el correo,
    /// 409 si el correo ya existe. Los errores incluyen "message" y "fieldErrors" por campo.
    /// </returns>
    [Authorize(Roles = "Administrador")]
    [HttpPost("register-technician")]
    public async Task<IActionResult> RegisterTechnician(
        [FromBody] TechnicianRegistrationRequestDto request)
    {
        var result = await _authService.RegisterTechnicianAsync(request);

        if (result.Success)
        {
            return Ok(new { message = result.Message });
        }

        var errorBody = new { message = result.Message, fieldErrors = result.FieldErrors };

        return result.IsDuplicateEmail ? Conflict(errorBody) : BadRequest(errorBody);
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado de la operación.</returns>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<PasswordChangeResponseDto>> ChangePassword(
        [FromBody] PasswordChangeRequestDto request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new
            {
                message = "No se pudo identificar al usuario autenticado"
            });
        }

        var result =
            await _authService.ChangePasswordAsync(userId, request);

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message,
                fieldErrors = result.FieldErrors
            });
        }

        Response.Cookies.Delete("access_token");

        return Ok(result);
    }

    /// <summary>
    /// Cierra la sesión del usuario eliminando la cookie de autenticación.
    /// </summary>
    /// <returns>Resultado de la operación.</returns>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });

        // Elimina también cookies creadas antes de establecer Path = "/".
        Response.Cookies.Delete("access_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/api/auth"
        });

        return Ok(new
        {
            message = "Sesión cerrada"
        });
    }
}
