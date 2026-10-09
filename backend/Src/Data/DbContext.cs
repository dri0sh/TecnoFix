using Microsoft.EntityFrameworkCore;
using TecnoFix.Src.Model;

namespace TecnoFix.Src.Data;

/// <summary>
/// Contexto de acceso a la base de datos para el sistema TecnoFix.
/// </summary>
public class TecnoFixDbContext : DbContext
{
    /// <summary>
    /// Inicializa una nueva instancia del contexto.
    /// </summary>
    /// <param name="options">Opciones de configuración para el contexto.</param>
    public TecnoFixDbContext(DbContextOptions<TecnoFixDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Usuarios registrados en el sistema.
    /// </summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>
    /// Roles disponibles en el sistema.
    /// </summary>
    public DbSet<Role> Roles => Set<Role>();

    /// <summary>
    /// Configura las entidades y relaciones de la base de datos.
    /// </summary>
    /// <param name="modelBuilder">
    /// Constructor del modelo de Entity Framework.
    /// </param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuración de la entidad Role.
        modelBuilder.Entity<Role>(entity =>
        {
            // Se mantiene el nombre de la tabla existente en la base de datos.
            entity.ToTable("Roles");

            entity.HasKey(role => role.Id);

            // Name corresponde a la columna Nombre en la base de datos.
            entity.Property(role => role.Name)
                .HasColumnName("Nombre")
                .HasMaxLength(30)
                .IsRequired();
        });

        // Configuración de la entidad User.
        modelBuilder.Entity<User>(entity =>
        {
            // Se mantiene el nombre de la tabla existente en la base de datos.
            entity.ToTable("Usuarios");

            entity.HasKey(user => user.Id);

            // Name corresponde a la columna Nombre en la base de datos.
            entity.Property(user => user.Name)
                .HasColumnName("Nombre")
                .HasMaxLength(150)
                .IsRequired();

            // Email corresponde a la columna Correo en la base de datos.
            entity.Property(user => user.Email)
                .HasColumnName("Correo")
                .HasMaxLength(256)
                .IsRequired();

            // Rut mantiene el mismo nombre en código y base de datos.
            entity.Property(user => user.Rut)
                .HasColumnName("Rut")
                .HasMaxLength(10)
                .IsRequired();

            // PhoneNumber corresponde a la columna Telefono en la base de datos.
            entity.Property(user => user.PhoneNumber)
                .HasColumnName("Telefono")
                .IsRequired();

            // PasswordHash mantiene el mismo nombre en código y base de datos.
            entity.Property(user => user.PasswordHash)
                .HasColumnName("PasswordHash")
                .IsRequired();

            // RoleId corresponde a la columna IdRol en la base de datos.
            entity.Property(user => user.RoleId)
                .HasColumnName("IdRol")
                .IsRequired();

            // Se establecen índices únicos para correo electrónico y RUT.
            entity.HasIndex(user => user.Email)
                .IsUnique();

            entity.HasIndex(user => user.Rut)
                .IsUnique();

            // Se establece la relación entre User y Role.
            entity.HasOne(user => user.Role)
                .WithMany(role => role.Users)
                .HasForeignKey(user => user.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(modelBuilder);
    }
}