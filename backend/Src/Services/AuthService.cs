using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Utils;
using TecnoFix.Src.Services.Interfaces;
using TecnoFix.Src.Model;

namespace TecnoFix.Src.Services;

/// <summary>
/// Implementa los servicios de autenticación y registro de usuarios.
/// </summary>
public class AuthService : IAuthService
{
    private readonly TecnoFixDbContext _context;
    private readonly IEmailService _emailService;

    /// <summary>
    /// Inicializa una nueva instancia del servicio de autenticación.
    /// </summary>
    /// <param name="context">Contexto de acceso a la base de datos PostgreSQL.</param>
    /// <param name="emailService">Servicio para el despacho de correos electrónicos.</param>
    public AuthService(TecnoFixDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    public async Task<CambiarPasswordResponseDto> CambiarPasswordAsync(int usuarioId, CambiarPasswordRequestDto request)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(usuario => usuario.Id == usuarioId);

        if (usuario is null) 
        {
            return new CambiarPasswordResponseDto{
                Exito = false,
                Mensaje = "Usuario no encontrado"
            };
        }

        if (!BCrypt.Net.BCrypt.Verify(request.PasswordActual, usuario.PasswordHash))
        {
            return new CambiarPasswordResponseDto{
                Exito = false,
                Mensaje = "La contraseña actual es incorrecta"
            };
        }

        if (request.PasswordNueva.Length < 8 || !request.PasswordNueva.Any(char.IsLetter) || !request.PasswordNueva.Any(char.IsDigit))
        {
            return new CambiarPasswordResponseDto {
                Exito = false,
                Mensaje = "La contraseña debe tener al menos 8 caracteres, una letra y un número"
            };
        }

        if (request.PasswordNueva != request.ConfirmarPasswordNueva)
        {
            return new CambiarPasswordResponseDto {
                Exito = false,
                Mensaje = "Las contraseñas ingresadas no coinciden"
            };
        }

        if (BCrypt.Net.BCrypt.Verify(request.PasswordNueva, usuario.PasswordHash))
        {
            return new CambiarPasswordResponseDto{
                Exito = false,
                Mensaje = "La nueva contraseña debe ser distinta de la actual"
            };
        }

        usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordNueva);

        await _context.SaveChangesAsync();

        return new CambiarPasswordResponseDto {
            Exito = true, 
            Mensaje = "Contraseña actualizada correctamente"
        };
    }

    /// <summary>
    /// Registra un nuevo técnico en el sistema, asegurando la no duplicidad de datos y enviando sus credenciales provisorias.
    /// </summary>
    public async Task<string> RegisterTecnicoAsync(TecnicoCreateDto dto)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Correo == dto.Correo))
            throw new Exception("El correo ya se encuentra registrado en el sistema.");

        if (await _context.Usuarios.AnyAsync(u => u.Rut == dto.Rut))
            throw new Exception("El RUT ya se encuentra registrado en el sistema.");

        var rolTecnico = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "Tecnico")
            ?? throw new Exception("No se encontró el rol de Técnico en la base de datos.");

        string passwordProvisoria = PasswordGenerator.GenerateRandomPassword(10);

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

        var mensajeCorreo = $"Hola {nuevoTecnico.Nombre},\n\n" +
                            $"Has sido registrado como Técnico en el sistema TecnoFix.\n" +
                            $"Tu contraseña provisoria de acceso es: {passwordProvisoria}\n\n" +
                            $"Por favor, cámbiala inmediatamente al ingresar por primera vez.";

        await _emailService.SendEmailAsync(
            nuevoTecnico.Correo,
            "Bienvenido a TecnoFix - Credenciales de Técnico",
            mensajeCorreo
        );

        return "Técnico registrado exitosamente.";
    }
}