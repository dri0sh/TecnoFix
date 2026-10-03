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
    // Inyección de dependencias para el contexto de la base de datos, 
    // la configuración y el servicio de correo electrónico
    private readonly TecnoFixDbContext _context;

    // <summary>
    /// Inicializa una nueva instancia del servicio de autenticación.
    /// </summary>
    /// <param name="context">Contexto de acceso a la base de datos.</param>
    public AuthService(TecnoFixDbContext context)
    {
        _context = context;
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
}