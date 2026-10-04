// Data/DbSeeder.cs
using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Model;

namespace TecnoFix.Src.Data;
/// <summary>
/// Clase estática que se encarga de sembrar datos iniciales en la base de datos.
/// </summary>
public static class DbSeeder
{
    /// <summary>
    /// Siembra los datos iniciales en la base de datos si no existen.
    /// </summary>
    /// <param name="context">Base de datos</param>
    /// <returns></returns>
    public static async Task SeedAsync(TecnoFixDbContext context)
    {
        if (!await context.Roles.AnyAsync())
        {
            context.Roles.AddRange(
                new Rol { Name = "Administrador" },
                new Rol { Name = "Cliente" },
                new Rol { Name = "Tecnico" }
            );
            await context.SaveChangesAsync();
        }

        var correoAdmin = "admin@tecnofix.cl";
        
        var yaExiste = await context.Usuarios.AnyAsync(u => u.Correo == correoAdmin);
        if (!yaExiste)
        {
            var rolAdmin = await context.Roles.FirstAsync(r => r.Name == "Administrador");

            context.Usuarios.Add(new Usuario
            {
                Name = "Admin",
                Correo = correoAdmin,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"), // se calcula en runtime, no en el modelo
                IdRol = rolAdmin.Id
            });

            await context.SaveChangesAsync();
        }
    }
}