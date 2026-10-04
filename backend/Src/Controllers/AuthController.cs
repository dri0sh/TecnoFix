using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Services;

namespace TecnoFix.Src.Controllers;
/// <summary>
/// Controlador para manejar la autenticación y el registro de usuarios.
/// </summary>
/// <param name="authService">Servicio de autenticación</param>

[ApiController]
[Route("api/[controller]")]
/// Controlador para manejar la autenticación y el registro de usuarios
public class AuthController(IAuthService authService) : ControllerBase
{
    // Servicio de autenticación inyectado en el controlador
    private readonly IAuthService _authService = authService;
    
    // POST: http://localhost:5321/api/auth/login
    // Generando un token JWT para el usuario autenticado 
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Correo) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { mensaje = "Debe completar correo y contraseña" });
        
        // Llamando al servicio de autenticación para validar las credenciales del usuario
        var resultado = await _authService.LoginAsync(request);

        if (resultado is null || (string.IsNullOrEmpty(resultado.Name) && string.IsNullOrEmpty(resultado.Rol)))
            return Unauthorized(new { mensaje = resultado?.Message ?? "Correo o contraseña incorrectos" });

        Response.Cookies.Append("access_token", resultado.Token, new CookieOptions
        {
            HttpOnly = true, 
            Secure = true,           
            SameSite = SameSiteMode.None,  
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });

        return Ok(
            new { usuario = resultado.Name,
            rol = resultado.Rol
        }); 
    }
    // POST: http://localhost:5321/api/auth/register
    // Registrando un nuevo cliente en el sistema
    [HttpPost("register")]
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

    // Si el correo o RUT ya están registrados,
    // informamos un conflicto con los datos existentes.
    if (resultado.Mensaje.Contains("ya se encuentra registrado"))
    {
        return Conflict(resultado);
    }

    // Si el RUT tiene un formato incorrecto o no es válido,
    // informamos que los datos enviados no son correctos.
    if (resultado.Mensaje.Contains("RUT"))
    {
        return BadRequest(resultado);
    }

    // Si el envío del correo falló, no se debe considerar
    // exitoso el registro del cliente.
    if (resultado.Mensaje.Contains("falló el envío del correo"))
    {
        return BadRequest(resultado);
    }

    return Ok(resultado);
}

    // POST: http://localhost:5321/api/auth/logout
    // Endpoint para cerrar la sesión del usuario
    [HttpHead("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token");
        return Ok(new { mensaje = "Sesión cerrada" });
    }
}