using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TecnoFix.Src.Model;

namespace TecnoFix.Src.Utils;

/// <summary>
/// Clase encargada de generar tokens JWT para usuarios autenticados.
/// </summary>
/// <param name="configuration">
/// Configuración de la aplicación.
/// </param>
public class TokenGenerator(IConfiguration configuration)
{
    private readonly IConfiguration _configuration = configuration;

    /// <summary>
    /// Genera un token JWT para el usuario autenticado.
    /// </summary>
    /// <param name="user">
    /// Usuario para el cual se generará el token.
    /// </param>
    /// <returns>
    /// Token JWT generado para el usuario.
    /// </returns>
    public string GenerateToken(User user)
    {
        // Elementos que se incluirán en el token como claims.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),

            new Claim(ClaimTypes.Name, user.Name),

            new Claim(ClaimTypes.Role, user.Role?.Name ?? string.Empty)
        };

        // Clave secreta utilizada para firmar el token.
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]!));

        var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Creación del token JWT.
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}