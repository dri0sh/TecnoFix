using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Model;
using TecnoFix.Src.Services.Interfaces;
using TecnoFix.Src.Utils;

namespace TecnoFix.Src.Services;

/// <summary>
/// Implementa los servicios de autenticación y registro de usuarios.
/// </summary>
public class AuthService : IAuthService
{
    private readonly TecnoFixDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailSender _emailSender;

    /// <summary>
    /// Inicializa una nueva instancia del servicio de autenticación.
    /// </summary>
    /// <param name="context">Contexto de acceso a la base de datos.</param>
    /// <param name="configuration">Configuración de la aplicación.</param>
    /// <param name="emailSender">Servicio para el envío de correos electrónicos.</param>
    public AuthService(
        TecnoFixDbContext context,
        IConfiguration configuration,
        IEmailSender emailSender)
    {
        _context = context;
        _configuration = configuration;
        _emailSender = emailSender;
    }

    /// <summary>
    /// Intenta autenticar a un usuario con sus credenciales.
    /// </summary>
    /// <param name="request">Credenciales del usuario.</param>
    /// <returns>Resultado del inicio de sesión.</returns>
    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var correo = request.Correo.Trim().ToLowerInvariant();

        var usuario = await _context.Usuarios.Include(u => u.RolUsuario).FirstOrDefaultAsync(u => u.Correo == correo);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Contrasena, usuario.PasswordHash))
        {
            return new LoginResponseDto
            {
                Exito = false,
                Mensaje = "Correo electrónico o contraseña incorrectos"
            };
        }

        return new LoginResponseDto
        {
            Exito = true,
            Mensaje = "Inicio de sesión exitoso",
            Token = new TokenGenerator(_configuration).GenerateToken(usuario),
            Correo = usuario.Correo,
            Rol = usuario.RolUsuario?.Nombre ?? string.Empty
        };
    }

    /// <summary>
    /// Registra un nuevo cliente en el sistema.
    /// </summary>
    /// <param name="request">Datos del nuevo cliente.</param>
    /// <returns>Resultado del registro.</returns>
    public async Task<RegistrarClienteResponseDto> RegistrarClienteAsync(RegistrarClienteRequestDto request)
    {
        var correoNormalizado = request.Correo.Trim().ToLowerInvariant();

        // El RUT debe ingresarse sin puntos ni guion.
        if (request.Rut.Contains('.') || request.Rut.Contains('-'))
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje =
                    "El RUT debe ingresarse sin puntos ni guion (ej.: 12345670K)"
            };
        }

        var rutNormalizado = RutValidator.ValidateRut(request.Rut);

        if (rutNormalizado is null)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "El RUT ingresado no es válido."
            };
        }

        var rolCliente = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "Cliente");

        if (rolCliente is null)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "No se encontró el rol de Cliente en la base de datos."
            };
        }

        var correoExiste = await _context.Usuarios.AnyAsync(u => u.Correo == correoNormalizado);

        if (correoExiste)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "El correo electrónico ingresado ya se encuentra registrado"
            };
        }

        var rutExiste = await _context.Usuarios.AnyAsync(u => u.Rut == rutNormalizado);

        if (rutExiste)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "El RUT ingresado ya se encuentra registrado"
            };
        }

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
                Name = string.Empty,
                Correo = string.Empty,
                Mensaje = $"Cliente no registrado, falló el envío del correo: {ex.Message}"
            };
        }

        var nuevoUsuario = new Usuario
        {
            Nombre = request.Name,
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
            Name = nuevoUsuario.Nombre,
            Correo = nuevoUsuario.Correo,
            Mensaje = "Cliente registrado. Revisa tu correo para la contraseña temporal."
        };
    }

    /// <summary>
    /// Registra un nuevo técnico en el sistema.
    /// </summary>
    /// <param name="dto">Datos del nuevo técnico.</param>
    /// <returns>Mensaje indicando el resultado de la operación.</returns>
    public async Task<string> RegisterTecnicoAsync(TecnicoCreateDto dto)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Correo == dto.Correo))
        {
            throw new Exception("El correo ya se encuentra registrado en el sistema.");
        }

        if (await _context.Usuarios.AnyAsync(u => u.Rut == dto.Rut))
        {
            throw new Exception("El RUT ya se encuentra registrado en el sistema.");
        }

        var rolTecnico = await _context.Roles
            .FirstOrDefaultAsync(r => r.Nombre == "Tecnico") ?? throw new Exception("No se encontró el rol de Técnico en la base de datos.");

        var passwordProvisoria =
            PasswordGenerator.GenerateRandomPassword(10);

        var nuevoTecnico = new Usuario
        {
            Nombre = dto.Nombre,
            Rut = dto.Rut,
            Correo = dto.Correo,
            Telefono = dto.Telefono,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordProvisoria),
            IdRol = rolTecnico.Id
        };

        _context.Usuarios.Add(nuevoTecnico);
        await _context.SaveChangesAsync();

        var mensajeCorreo =
            $"Hola {nuevoTecnico.Nombre},\n\n" +
            "Has sido registrado como Técnico en el sistema TecnoFix.\n" +
            $"Tu contraseña provisoria de acceso es: {passwordProvisoria}\n\n" +
            "Por favor, cámbiala inmediatamente al ingresar por primera vez.";

        await _emailSender.SendEmailAsync(
            nuevoTecnico.Correo,
            "Bienvenido a TecnoFix - Credenciales de Técnico",
            mensajeCorreo);

        return "Técnico registrado exitosamente.";
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="usuarioId">Identificador del usuario.</param>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado del cambio de contraseña.</returns>
    public async Task<CambiarPasswordResponseDto> CambiarPasswordAsync(
        int usuarioId,
        CambiarPasswordRequestDto request)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(usuario => usuario.Id == usuarioId);

        if (usuario is null)
        {
            return new CambiarPasswordResponseDto
            {
                Exito = false,
                Mensaje = "Usuario no encontrado"
            };
        }

        if (!BCrypt.Net.BCrypt.Verify(request.PasswordActual, usuario.PasswordHash))
        {
            return new CambiarPasswordResponseDto
            {
                Exito = false,
                Mensaje = "La contraseña actual es incorrecta"
            };
        }

        if (request.PasswordNueva.Length < 8 ||
            !request.PasswordNueva.Any(char.IsLetter) ||
            !request.PasswordNueva.Any(char.IsDigit))
        {
            return new CambiarPasswordResponseDto
            {
                Exito = false,
                Mensaje = "La contraseña debe tener al menos 8 caracteres, una letra y un número"
            };
        }

        if (request.PasswordNueva != request.ConfirmarPasswordNueva)
        {
            return new CambiarPasswordResponseDto
            {
                Exito = false,
                Mensaje = "Las contraseñas ingresadas no coinciden"
            };
        }

        if (BCrypt.Net.BCrypt.Verify(request.PasswordNueva, usuario.PasswordHash))
        {
            return new CambiarPasswordResponseDto
            {
                Exito = false,
                Mensaje = "La nueva contraseña debe ser distinta de la actual"
            };
        }

        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordNueva);

        await _context.SaveChangesAsync();

        return new CambiarPasswordResponseDto
        {
            Exito = true,
            Mensaje = "Contraseña actualizada correctamente"
        };
    }
}