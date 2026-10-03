using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Model;   

namespace TecnoFix.Src.Data;

/// <summary>
/// Contexto de acceso a la base de datos para el sistema TecnoFix.
/// </summary>
public class TecnoFixDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    /// <summary>
    /// Inicializa una nueva instancia del contexto.
    /// </summary>
    /// <param name="options">Opciones de configuración para el contexto.</param>
    public TecnoFixDbContext(DbContextOptions<TecnoFixDbContext> options) : base(options) {}

    /// <summary>
    /// Usuarios registrados en el sistema.
    /// </summary>
    public DbSet<Usuario> Usuarios => Set<Usuario>();

    /// <summary>
    /// Roles disponibles en el sistema.
    /// </summary>
    public DbSet<Rol> Roles => Set<Rol>();

    /// <summary>
    /// Configura las entidades y relaciones de la base de datos.
    /// </summary>
    /// <param name="modelBuilder">Constructor del modelo de Entity Framework.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuración de la entidad Rol
        modelBuilder.Entity<Rol>(e =>
        {
            // Se asigna el nombre de la tabla y la clave primaria
            e.ToTable("Roles");
            e.HasKey(r => r.Id);
            // Se establece la longitud máxima del nombre del rol y se marca como obligatorio
            e.Property(r => r.Nombre).HasMaxLength(30).IsRequired();
        });

        // Configuración de la entidad Usuario
        modelBuilder.Entity<Usuario>(e =>
        {
            // Se asigna el nombre de la tabla y la clave primaria
            e.ToTable("Usuarios");
            e.HasKey(u => u.Id);
            // Se establece la longitud máxima de los campos y se marcan como obligatorios
            e.Property(u => u.Nombre).HasMaxLength(150).IsRequired();
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