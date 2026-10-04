using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Utils;
using TecnoFix.Src.DTO;

using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Services;
/// <summary>
/// Implementa los servicios de autenticación y registro de usuarios.
/// </summary>
/// <param name="context">Base de datos</param>
/// <param name="configuration">Configuración de la aplicación</param>
/// <param name="emailSender">Servicio para envío de correos electrónicos</param>
public class AuthService(TecnoFixDbContext context, IConfiguration configuration, IEmailSender emailSender) : IAuthService
{
    // Inyección de dependencias para el contexto de la base de datos, 
    // la configuración y el servicio de correo electrónico
    private readonly TecnoFixDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;
    private readonly IEmailSender _emailSender = emailSender;

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.RolUsuario)
            .FirstOrDefaultAsync(u => u.Correo == request.Correo.Trim().ToLowerInvariant());
            // Clase usuario || null;
                                //  PANCHO123 => FASFASF   == WEKFNWE
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
            return new LoginResponseDto
            {
                Name = string.Empty,
                Rol = string.Empty,
                Message = "Correo o contraseña incorrectos"
            };

        return new LoginResponseDto
        {
            Token = new GenerateTokenClass(_configuration).GenerarToken(usuario),
            Name = usuario.Name,
            Rol = usuario.RolUsuario?.Name ?? string.Empty,
            Message = "Login successful"
        };
    }

    public async Task<RegistrarClienteResponseDto> RegistrarClienteAsync(RegistrarClienteRequestDto request)
{
    var correoNormalizado = request.Correo.Trim().ToLowerInvariant();

    // El RUT debe ingresarse sin puntos ni guion.
    if (request.Rut.Contains('.') || request.Rut.Contains('-'))
    {
        return new RegistrarClienteResponseDto
        {
            Mensaje = "El RUT debe ingresarse sin puntos ni guion (ej.: 12345670K)"
        };
    }

    var rutNormalizado = ValidatorRut.ValidarRut(request.Rut);

    // Verificamos que el RUT cumpla el algoritmo chileno.
    if (rutNormalizado is null)
    {
        return new RegistrarClienteResponseDto
        {
            Mensaje = "El RUT ingresado no es válido."
        };
    }

    // Buscamos el rol Cliente.
    var rolCliente = await _context.Roles
        .FirstOrDefaultAsync(r => r.Name == "Cliente");

    if (rolCliente is null)
    {
        return new RegistrarClienteResponseDto
        {
            Mensaje = "No se encontró el rol de Cliente en la base de datos."
        };
    }

    // Primero verificamos si el correo ya está registrado.
    var correoExiste = await _context.Usuarios
        .AnyAsync(u => u.Correo == correoNormalizado);

    if (correoExiste)
    {
        return new RegistrarClienteResponseDto
        {
            Mensaje = "El correo electrónico ingresado ya se encuentra registrado"
        };
    }

    // Después verificamos si el RUT ya está registrado.
    var rutExiste = await _context.Usuarios
        .AnyAsync(u => u.Rut == rutNormalizado);

    if (rutExiste)
    {
        return new RegistrarClienteResponseDto
        {
            Mensaje = "El RUT ingresado ya se encuentra registrado"
        };
    }

    // Generamos la contraseña temporal de 8 caracteres.
    var passwordTemporal = PasswordGenerator.GenerateRandomPassword();

    try
    {
        var cuerpoHtml = $"""
            <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 480px;">
            <h2 style="color: #1d4ed8;">Bienvenido a TecnoFix, {request.Name}</h2>
            <p>Tu cuenta fue creada exitosamente. Esta es tu contraseña temporal:</p>
            <p style="font-size: 18px; font-weight: bold; letter-spacing: 1px;">{passwordTemporal}</p>
            <p>Te recomendamos cambiarla después de tu primer inicio de sesión.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
            </div>
        """;

        await _emailSender.SendEmailAsync(
            request.Correo.Trim(),
            "Tu contraseña temporal - TecnoFix",
            cuerpoHtml);
    }
    catch (Exception ex)
    {
        return new RegistrarClienteResponseDto
        {
            Id = 0,
            Name = "",
            Correo = "",
            Mensaje = $"Cliente no registrado, falló el envío del correo: {ex.Message}"
        };
    }

    var nuevoUsuario = new Model.Usuario
    {
        Name = request.Name,
        Correo = correoNormalizado,
        Rut = rutNormalizado,
        Telefono = request.Telefono,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordTemporal),
        IdRol = rolCliente.Id
    };

    _context.Usuarios.Add(nuevoUsuario);
    await _context.SaveChangesAsync();

    return new RegistrarClienteResponseDto
    {
        Id = nuevoUsuario.Id,
        Name = nuevoUsuario.Name,
        Correo = nuevoUsuario.Correo,
        Mensaje = "Cliente registrado. Revisa tu correo para la contraseña temporal."
    };
}
 
}