using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Utils;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Services;
/// <summary>
/// Implementa los servicios de autenticación y registro de usuarios.
/// </summary>
public class AuthService : IAuthService
{
    // Inyección de dependencias para el contexto de la base de datos
    // y el generador de tokens JWT
    private readonly TecnoFixDbContext _context;
    private readonly GenerateTokenClass _generateToken;

    /// <summary>
    /// Inicializa una nueva instancia del servicio de autenticación.
    /// </summary>
    /// <param name="context">Contexto de acceso a la base de datos.</param>
    /// <param name="generateToken">Generador de tokens JWT.</param>
    public AuthService(TecnoFixDbContext context, GenerateTokenClass generateToken)
    {
        _context = context;
        _generateToken = generateToken;
    }

    /// <summary>
    /// Inicia sesión validando correo y contraseña (USU-001).
    /// </summary>
    /// <param name="request">Correo y contraseña ingresados.</param>
    /// <returns>Resultado del inicio de sesión, con el token si fue exitoso.</returns>
    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        var correo = request.Correo.Trim().ToLower();

        var usuario = await _context.Usuarios
            .Include(u => u.RolUsuario)
            .FirstOrDefaultAsync(u => u.Correo == correo);   // Si la propiedad se llama Email, cambiar aquí

        // Mensaje genérico: no revela si falló el correo o la contraseña
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
            Token = _generateToken.GenerarToken(usuario),
            Correo = usuario.Correo,                          // Si la propiedad se llama Email, cambiar aquí
            Rol = usuario.RolUsuario?.Nombre ?? ""
        };
    }

    /// <summary>
    /// Cambia la contraseña del usuario autenticado.
    /// </summary>
    /// <param name="usuarioId">Identificador del usuario autenticado.</param>
    /// <param name="request">Datos necesarios para cambiar la contraseña.</param>
    /// <returns>Resultado de la operación.</returns>
    public async Task<CambiarPasswordResponseDto> CambiarPasswordAsync(int usuarioId, CambiarPasswordRequestDto request)
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

        if (request.PasswordNueva.Length < 8 || !request.PasswordNueva.Any(char.IsLetter) || !request.PasswordNueva.Any(char.IsDigit))
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