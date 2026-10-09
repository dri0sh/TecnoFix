using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.User;
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
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .Include(user => user.Role)
            .FirstOrDefaultAsync(user => user.Email == normalizedEmail);

        if (user is null ||
            !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return new LoginResponseDto
            {
                Success = false,
                Message = "Correo electrónico o contraseña incorrectos"
            };
        }

        return new LoginResponseDto
        {
            Success = true,
            Message = "Inicio de sesión exitoso",
            Token = new TokenGenerator(_configuration).GenerateToken(user),
            Email = user.Email,
            Role = user.Role?.Name ?? string.Empty
        };
    }

    /// <summary>
    /// Registra un nuevo cliente en el sistema.
    /// </summary>
    /// <param name="request">Datos del nuevo cliente.</param>
    /// <returns>Resultado del registro.</returns>
    public async Task<ClientRegistrationResponseDto> RegisterClientAsync(
        ClientRegistrationRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // El RUT debe ingresarse sin puntos ni guion.
        if (request.Rut.Contains('.') || request.Rut.Contains('-'))
        {
            return new ClientRegistrationResponseDto
            {
                Message = "El RUT debe ingresarse sin puntos ni guion (ej.: 12345670K)"
            };
        }

        var normalizedRut = RutValidator.ValidateRut(request.Rut);

        if (normalizedRut is null)
        {
            return new ClientRegistrationResponseDto
            {
                Message = "El RUT ingresado no es válido."
            };
        }

        var clientRole = await _context.Roles.FirstOrDefaultAsync(role => role.Name == "Cliente");

        if (clientRole is null)
        {
            return new ClientRegistrationResponseDto
            {
                Message = "No se encontró el rol de Cliente en la base de datos."
            };
        }

        var emailExists = await _context.Users.AnyAsync(user => user.Email == normalizedEmail);

        if (emailExists)
        {
            return new ClientRegistrationResponseDto
            {
                Message = "El correo electrónico ingresado ya se encuentra registrado"
            };
        }

        var rutExists = await _context.Users.AnyAsync(user => user.Rut == normalizedRut);

        if (rutExists)
        {
            return new ClientRegistrationResponseDto
            {
                Message = "El RUT ingresado ya se encuentra registrado"
            };
        }

        var temporaryPassword = PasswordGenerator.GenerateRandomPassword();

        try
        {
            var emailBody = $"""
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 480px;">
                    <h2 style="color: #1d4ed8;">Bienvenido a TecnoFix, {request.Name}</h2>
                    <p>Tu cuenta fue creada exitosamente. Esta es tu contraseña temporal:</p>
                    <p style="font-size: 18px; font-weight: bold; letter-spacing: 1px;">{temporaryPassword}</p>
                    <p>Te recomendamos cambiarla después de tu primer inicio de sesión.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
                </div>
                """;

            await _emailSender.SendEmailAsync(request.Email.Trim(), "Tu contraseña temporal - TecnoFix", emailBody);
        }
        catch (Exception ex)
        {
            return new ClientRegistrationResponseDto
            {
                Id = 0,
                Name = string.Empty,
                Email = string.Empty,
                Message = $"Cliente no registrado, falló el envío del correo: {ex.Message}"
            };
        }

        var newUser = new User
        {
            Name = request.Name,
            Email = normalizedEmail,
            Rut = normalizedRut,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            RoleId = clientRole.Id
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return new ClientRegistrationResponseDto
        {
            Id = newUser.Id,
            Name = newUser.Name,
            Email = newUser.Email,
            Message = "Cliente registrado. Revisa tu correo para la contraseña temporal."
        };
    }

    /// <summary>
    /// Registra un nuevo técnico en el sistema.
    /// </summary>
    /// <param name="request">Datos del nuevo técnico.</param>
    /// <returns>Mensaje indicando el resultado de la operación.</returns>
    public async Task<string> RegisterTechnicianAsync(
        TechnicianRegistrationRequestDto request)
    {
        if (await _context.Users.AnyAsync(user => user.Email == request.Email))
        {
            throw new Exception("El correo ya se encuentra registrado en el sistema.");
        }

        if (await _context.Users.AnyAsync(user => user.Rut == request.Rut))
        {
            throw new Exception("El RUT ya se encuentra registrado en el sistema.");
        }

        var technicianRole = await _context.Roles
            .FirstOrDefaultAsync(role => role.Name == "Tecnico") ?? throw new Exception("No se encontró el rol de Técnico en la base de datos.");

        var temporaryPassword = PasswordGenerator.GenerateRandomPassword(10);

        var newTechnician = new User
        {
            Name = request.Name,
            Rut = request.Rut,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            RoleId = technicianRole.Id
        };

        _context.Users.Add(newTechnician);
        await _context.SaveChangesAsync();

        var emailMessage = $"Hola {newTechnician.Name},\n\n" +
            "Has sido registrado como Técnico en el sistema TecnoFix.\n" +
            $"Tu contraseña provisoria de acceso es: {temporaryPassword}\n\n" +
            "Por favor, cámbiala inmediatamente al ingresar por primera vez.";

        await _emailSender.SendEmailAsync(
            newTechnician.Email,
            "Bienvenido a TecnoFix - Credenciales de Técnico",
            emailMessage);

        return "Técnico registrado exitosamente.";
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="userId">Identificador del usuario.</param>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado del cambio de contraseña.</returns>
    public async Task<PasswordChangeResponseDto> ChangePasswordAsync(
        int userId,
        PasswordChangeRequestDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(user => user.Id == userId);

        if (user is null)
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "Usuario no encontrado"
            };
        }

        if (!BCrypt.Net.BCrypt.Verify(
                request.CurrentPassword,
                user.PasswordHash))
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "La contraseña actual es incorrecta"
            };
        }

        if (request.NewPassword.Length < 8 ||
            !request.NewPassword.Any(char.IsLetter) ||
            !request.NewPassword.Any(char.IsDigit))
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "La contraseña debe tener al menos 8 caracteres, una letra y un número"
            };
        }

        if (request.NewPassword != request.ConfirmNewPassword)
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "Las contraseñas ingresadas no coinciden"
            };
        }

        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "La nueva contraseña debe ser distinta de la actual"
            };
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        await _context.SaveChangesAsync();

        return new PasswordChangeResponseDto
        {
            Success = true,
            Message = "Contraseña actualizada correctamente"
        };
    }
}