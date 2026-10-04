using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Model;
using TecnoFix.Src.DTO.Usuario;
using TecnoFix.Src.DTO;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Data;
/// <summary>
/// Representa el contexto de la base de datos para la aplicación TecnoFix.
/// </summary>
public class TecnoFixDbContext : DbContext
{
    /// <summary>
    /// Constructor de la clase
    /// </summary>
    /// <param name="options">Opciones del contexto de la base de datos</param>
    public TecnoFixDbContext(DbContextOptions<TecnoFixDbContext> options) : base(options) { }
    // Creaciones de las tablas
    public DbSet<Usuario> Usuarios => Set<Usuario>(); 
    public DbSet<Rol> Roles => Set<Rol>();
    /// <summary>
    /// Configura el modelo de la base de datos y las relaciones entre las entidades.
    /// </summary>
    /// <param name="modelBuilder">Constructor del modelo de la base de datos</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuración de la entidad Rol
        modelBuilder.Entity<Rol>(e =>
        {
            // Se asigna el nombre de la tabla y la clave primaria
            e.ToTable("Roles");
            e.HasKey(r => r.Id);
            // Se establece la longitud máxima del nombre del rol y se marca como obligatorio
            e.Property(r => r.Name).HasMaxLength(30).IsRequired();
        });
        // Configuración de la entidad Usuario
        modelBuilder.Entity<Usuario>(e =>
        {
            // Se asigna el nombre de la tabla y la clave primaria
            e.ToTable("Usuarios");
            e.HasKey(u => u.Id);
            // Se establece la longitud máxima de los campos y se marcan como obligatorios
            e.Property(u => u.Name).HasMaxLength(150).IsRequired();
            e.Property(u => u.Correo).HasMaxLength(256).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.Rut).HasMaxLength(10);
            // Se establecen índices únicos para los campos Correo y Rut
            e.HasIndex(u => u.Correo).IsUnique();
            e.HasIndex(u => u.Rut).IsUnique();
            // Se establece la relación entre Usuario y Rol
            e.HasOne(u => u.RolUsuario)
             .WithMany(r => r.Usuarios)
             .HasForeignKey(u => u.IdRol)
             // Se establece el comportamiento de eliminación en cascada para la relación entre Usuario y Rol
             .OnDelete(DeleteBehavior.Restrict);      
        });
        // Se llama al método base para completar la configuración del modelo
        base.OnModelCreating(modelBuilder);
    }
}