using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Model;

namespace TecnoFix.Src.Data;

/// <summary>
/// Clase estática encargada de sembrar datos iniciales en la base de datos.
/// </summary>
public static class DbSeeder
{
    /// <summary>
    /// Siembra los datos iniciales en la base de datos si no existen.
    /// </summary>
    /// <param name="context">
    /// Contexto de acceso a la base de datos.
    /// </param>
    public static async Task SeedAsync(TecnoFixDbContext context)
    {
        if (!await context.Roles.AnyAsync())
        {
            context.Roles.AddRange(
                new Role { Name = "Administrador" },
                new Role { Name = "Cliente" },
                new Role { Name = "Tecnico" }
            );

            await context.SaveChangesAsync();
        }

        var adminEmail = "admin2@tecnofix.cl";

        var exists = await context.Users.AnyAsync(user => user.Email == adminEmail);

        if (!exists)
        {
            var adminRole = await context.Roles.FirstAsync(role => role.Name == "Administrador");

            context.Users.Add(new User
            {
                Name = "Admin2",
                Email = adminEmail,
                Rut = "202117627",
                PhoneNumber = "000000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"),
                RoleId = adminRole.Id
            });

            await context.SaveChangesAsync();
        }
    }
}