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
                new Rol { Nombre = "Administrador" },
                new Rol { Nombre = "Cliente" },
                new Rol { Nombre = "Tecnico" }
            );
            await context.SaveChangesAsync();
        }

        var correoAdmin = "admin2@tecnofix.cl";
        
        var yaExiste = await context.Usuarios.AnyAsync(u => u.Correo == correoAdmin);
        if (!yaExiste)
        {
            var rolAdmin = await context.Roles.FirstAsync(r => r.Nombre == "Administrador");

            context.Usuarios.Add(new Usuario
            {
                Nombre = "Admin2",
                Correo = correoAdmin,
                Rut = "20211762-7",
                Telefono = "000000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"), // se calcula en runtime, no en el modelo
                IdRol = rolAdmin.Id
            });

            await context.SaveChangesAsync();
        }
    }
}