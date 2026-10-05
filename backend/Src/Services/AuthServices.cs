using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Data;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.Utils;
using TecnoFix.Src.DTO;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Services;

public class AuthService(
    TecnoFixDbContext context,
    IConfiguration configuration,
    IEmailSender emailSender) : IAuthService
{
    private readonly TecnoFixDbContext _context = context;
    private readonly IConfiguration _configuration = configuration;
    private readonly IEmailSender _emailSender = emailSender;

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.RolUsuario)
            .FirstOrDefaultAsync(
                u => u.Correo == request.Correo.Trim().ToLowerInvariant());

        if (usuario is null ||
            !BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash))
        {
            return new LoginResponseDto
            {
                Name = string.Empty,
                Rol = string.Empty,
                Message = "Correo o contraseña incorrectos"
            };
        }

        return new LoginResponseDto
        {
            Token = new GenerateTokenClass(_configuration).GenerarToken(usuario),
            Name = usuario.Name,
            Rol = usuario.RolUsuario?.Name ?? string.Empty,
            Message = "Login successful"
        };
    }

    public async Task<RegistrarClienteResponseDto> RegistrarClienteAsync(
        RegistrarClienteRequestDto request)
    {
        // Normalizar correo
        var correoNormalizado = request.Correo.Trim().ToLowerInvariant();

        // Validar formato del RUT
        if (request.Rut.Contains('.') || request.Rut.Contains('-'))
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "El RUT debe ingresarse sin puntos ni guion (ej.: 12345670K)"
            };
        }

        // Validar RUT
        var rutNormalizado = ValidatorRut.ValidarRut(request.Rut);

        if (rutNormalizado is null)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "El RUT ingresado no es válido."
            };
        }

        // Buscar el rol Cliente
        var rolCliente = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Cliente");

        if (rolCliente is null)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "No se encontró el rol de Cliente en la base de datos."
            };
        }

        // Comprobar si el correo ya existe
        var correoExiste = await _context.Usuarios
            .AnyAsync(u => u.Correo == correoNormalizado);

        if (correoExiste)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "El correo electrónico ingresado ya se encuentra registrado"
            };
        }

        // Comprobar si el RUT ya existe
        var rutExiste = await _context.Usuarios
            .AnyAsync(u => u.Rut == rutNormalizado);

        if (rutExiste)
        {
            return new RegistrarClienteResponseDto
            {
                Mensaje = "El RUT ingresado ya se encuentra registrado"
            };
        }

        // Generar contraseña temporal
        var passwordTemporal = PasswordGenerator.GenerateRandomPassword();

        // Crear nuevo usuario
        var nuevoUsuario = new Model.Usuario
        {
            Name = request.Name,
            Correo = correoNormalizado,
            Rut = rutNormalizado,
            Telefono = request.Telefono,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordTemporal),
            IdRol = rolCliente.Id
        };

        // Guardar usuario en la base de datos
        _context.Usuarios.Add(nuevoUsuario);
        await _context.SaveChangesAsync();

        // Respuesta temporal para pruebas sin SendGrid
        return new RegistrarClienteResponseDto
        {
            Id = nuevoUsuario.Id,
            Name = nuevoUsuario.Name,
            Correo = nuevoUsuario.Correo,
            Mensaje = $"Cliente registrado correctamente. Contraseña temporal: {passwordTemporal}"
        };
    }
}