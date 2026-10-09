using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TecnoFix.Src.Model;

namespace TecnoFix.Src.Utils;
/// <summary>
/// Clase para generar tokens JWT para usuarios autenticados.
/// </summary>
/// <param name="configuration"></param>
public class TokenGenerator(IConfiguration configuration)
{   
    //  Inyección de dependencias para la configuración de la aplicación
    private readonly IConfiguration _configuration = configuration;
    // Genera un token JWT para el usuario autenticado
    public string GenerateToken(Usuario usuario)
    {
        // Elementos que se incluirán en el token JWT como claims (reclamaciones)
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Role, usuario.RolUsuario?.Nombre ?? string.Empty)
        };
        // Clave secreta para firmar el token, obtenida de la configuración
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    
        // Creación del token JWT con los claims, la fecha de expiración y las credenciales de firma
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"], // Emisor del token, obtenido de la configuración
            audience: _configuration["Jwt:Audience"], // Audiencia del token, obtenida de la configuración
            claims: claims,// Claims que se incluirán en el token
            expires: DateTime.UtcNow.AddHours(1),// Fecha de expiración del token (1 hora a partir de la creación)
            signingCredentials: creds);// Credenciales de firma para asegurar la integridad del token
        // Se devuelve el token JWT como una cadena
        return new JwtSecurityTokenHandler().WriteToken(token) ;//string 
    }
}