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
    /// Entrega las especialidades registradas, en el orden en que se agregaron.
    /// </summary>
    public async Task<List<string>> GetTechnicianSpecialtiesAsync()
    {
        return await _context.Specialties
            .OrderBy(specialty => specialty.Id)
            .Select(specialty => specialty.Name)
            .ToListAsync();
    }

    /// <summary>
    /// Agrega una nueva especialidad al catálogo (USU-003).
    /// </summary>
    /// <param name="request">Nombre de la nueva especialidad.</param>
    /// <returns>Resultado, con el error del campo si lo hay.</returns>
    public async Task<SpecialtyResponseDto> AddSpecialtyAsync(SpecialtyRequestDto request)
    {
        const int MAX_SPECIALTY_LENGTH = 60;
        const string DUPLICATE_SPECIALTY_MESSAGE = "La especialidad ingresada ya se encuentra registrada";

        var name = (request.Name ?? string.Empty).Trim();

        string? error = null;

        if (name.Length == 0)
        {
            error = InputValidator.RequiredFieldMessage("Especialidad");
        }
        else if (name.Length > MAX_SPECIALTY_LENGTH)
        {
            error = $"La especialidad no puede superar los {MAX_SPECIALTY_LENGTH} caracteres";
        }

        if (error is not null)
        {
            return new SpecialtyResponseDto
            {
                Success = false,
                Message = error,
                FieldErrors = new Dictionary<string, string> { ["name"] = error }
            };
        }

        // Se compara sin distinguir mayúsculas: "Redes" y "redes" son la misma especialidad
        var lowerName = name.ToLower();

        if (await _context.Specialties.AnyAsync(specialty => specialty.Name.ToLower() == lowerName))
        {
            return new SpecialtyResponseDto
            {
                Success = false,
                Message = DUPLICATE_SPECIALTY_MESSAGE,
                FieldErrors = new Dictionary<string, string> { ["name"] = DUPLICATE_SPECIALTY_MESSAGE },
                IsDuplicateName = true
            };
        }

        _context.Specialties.Add(new Specialty { Name = name });
        await _context.SaveChangesAsync();

        return new SpecialtyResponseDto
        {
            Success = true,
            Message = "Especialidad registrada correctamente",
            Name = name
        };
    }

    /// <summary>
    /// Registra un nuevo técnico en el sistema (USU-003).
    /// </summary>
    /// <param name="request">Nombre y apellidos, correo electrónico y especialidad.</param>
    /// <returns>Resultado del registro, con los errores por campo si los hay.</returns>
    public async Task<TechnicianRegistrationResponseDto> RegisterTechnicianAsync(
        TechnicianRegistrationRequestDto request)
    {
        // Se limpian los datos antes de validar. "?? string.Empty" cubre el caso
        // en que el campo no viene en la petición (llega como null).
        var name = (request.Name ?? string.Empty).Trim();
        var email = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        var specialty = (request.Specialty ?? string.Empty).Trim();

        // 1. Formato de los campos: se revisan todos para informar todos los errores juntos
        var fieldErrors = ValidateTechnicianFields(name, email, specialty);

        if (fieldErrors.Count > 0)
        {
            return new TechnicianRegistrationResponseDto
            {
                Success = false,
                Message = fieldErrors.Values.First(),
                FieldErrors = fieldErrors
            };
        }

        // La especialidad debe existir en el catálogo (incluye las agregadas por el administrador)
        if (!await _context.Specialties.AnyAsync(item => item.Name == specialty))
        {
            const string INVALID_SPECIALTY_MESSAGE = "La especialidad seleccionada no es válida";

            return new TechnicianRegistrationResponseDto
            {
                Success = false,
                Message = INVALID_SPECIALTY_MESSAGE,
                FieldErrors = new Dictionary<string, string> { ["specialty"] = INVALID_SPECIALTY_MESSAGE }
            };
        }

        // 2. El correo debe ser único en el sistema (mensaje exacto de la ERS)
        if (await _context.Users.AnyAsync(user => user.Email == email))
        {
            const string DUPLICATE_EMAIL_MESSAGE = "El correo electrónico ingresado ya se encuentra registrado";

            return new TechnicianRegistrationResponseDto
            {
                Success = false,
                Message = DUPLICATE_EMAIL_MESSAGE,
                FieldErrors = new Dictionary<string, string> { ["email"] = DUPLICATE_EMAIL_MESSAGE },
                IsDuplicateEmail = true
            };
        }

        var technicianRole = await _context.Roles.FirstOrDefaultAsync(role => role.Name == "Tecnico");

        if (technicianRole is null)
        {
            return new TechnicianRegistrationResponseDto
            {
                Success = false,
                Message = "No se encontró el rol de técnico en la base de datos."
            };
        }

        // 3. Contraseña temporal: el generador cumple las reglas de cambiar contraseña
        //    (al menos 8 caracteres, una letra y un número)
        var temporaryPassword = PasswordGenerator.GenerateRandomPassword();

        var technician = new User
        {
            Name = name,
            Email = email,
            Specialty = specialty,
            IsEnabled = true, // El técnico queda habilitado por defecto (USU-003)
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            RoleId = technicianRole.Id
        };

        // 4. Se guarda el técnico y se envía el correo dentro de una transacción:
        //    si el correo falla, se deshace el registro para no dejar un técnico
        //    que no tiene cómo conocer su contraseña.
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            _context.Users.Add(technician);
            await _context.SaveChangesAsync();

            // Mismo formato del correo de registrar cliente (hallazgo C6)
            var emailBody = $"""
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 480px;">
                    <h2 style="color: #1d4ed8;">Bienvenido a TecnoFix, {technician.Name}</h2>
                    <p>Tu cuenta fue creada exitosamente. Esta es tu contraseña temporal:</p>
                    <p style="font-size: 18px; font-weight: bold; letter-spacing: 1px;">{temporaryPassword}</p>
                    <p>Te recomendamos cambiarla después de tu primer inicio de sesión.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">Este es un correo automático, por favor no respondas.</p>
                </div>
                """;

            await _emailSender.SendEmailAsync(technician.Email, "Tu contraseña temporal - TecnoFix", emailBody);

            await transaction.CommitAsync();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();

            return new TechnicianRegistrationResponseDto
            {
                Success = false,
                Message = "No se pudo registrar el técnico (falló el guardado o el envío del correo). Intente nuevamente."
            };
        }

        return new TechnicianRegistrationResponseDto
        {
            Success = true,
            Message = "Técnico registrado exitosamente. La contraseña temporal fue enviada a su correo."
        };
    }

    /// <summary>
    /// Valida los campos de registrar técnico según la tarjeta USU-003.
    /// </summary>
    /// <returns>Diccionario con el error de cada campo inválido (vacío si todo está correcto).</returns>
    private static Dictionary<string, string> ValidateTechnicianFields(string name, string email, string specialty)
    {
        var errors = new Dictionary<string, string>();

        if (name.Length == 0)
        {
            errors["name"] = InputValidator.RequiredFieldMessage("Nombre y apellidos");
        }
        else if (!InputValidator.IsValidPersonName(name))
        {
            errors["name"] = "El nombre solo puede contener letras y espacios";
        }

        if (email.Length == 0)
        {
            errors["email"] = InputValidator.RequiredFieldMessage("Correo electrónico");
        }
        else if (!InputValidator.IsValidEmail(email))
        {
            errors["email"] = "El correo electrónico no tiene un formato válido";
        }

        if (specialty.Length == 0)
        {
            errors["specialty"] = InputValidator.RequiredFieldMessage("Especialidad");
        }

        return errors;
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

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "La contraseña actual es incorrecta",
                FieldErrors = new Dictionary<string, string>
                {
                    ["currentPassword"] = "La contraseña actual es incorrecta"
                }
            };
        }

        if (request.NewPassword.Length < 8 ||
            !request.NewPassword.Any(char.IsLetter) ||
            !request.NewPassword.Any(char.IsDigit))
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "La contraseña debe tener al menos 8 caracteres, una letra y un número",
                FieldErrors = new Dictionary<string, string>
                {
                    ["newPassword"] = "La contraseña debe tener al menos 8 caracteres, una letra y un número"
                }
            };
        }

        if (request.NewPassword != request.ConfirmNewPassword)
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message = "Las contraseñas ingresadas no coinciden",
                FieldErrors = new Dictionary<string, string>
                {
                    ["confirmNewPassword"] = "Las contraseñas ingresadas no coinciden"
                }
            };
        }

        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
        {
            return new PasswordChangeResponseDto
            {
                Success = false,
                Message =
                    "La nueva contraseña debe ser distinta de la actual",
                FieldErrors = new Dictionary<string, string>
                {
                    ["newPassword"] =
                        "La nueva contraseña debe ser distinta de la actual"
                }
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