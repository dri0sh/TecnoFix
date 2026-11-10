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
    /// Catálogo de tipos de equipo (ADM-001).
    /// </summary>
    public DbSet<EquipmentType> EquipmentTypes => Set<EquipmentType>();

    /// <summary>
    /// Órdenes de reparación (ORD-001).
    /// </summary>
    public DbSet<RepairOrder> RepairOrders => Set<RepairOrder>();

    /// <summary>
    /// Bitácora de las órdenes: un registro por cada cambio de estado.
    /// </summary>
    public DbSet<OrderLog> OrderLogs => Set<OrderLog>();

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

            // RUT opcional: solo lo ingresa el cliente (USU-002).
            // Registrar técnico (USU-003) no lo solicita.
            entity.Property(user => user.Rut)
                .HasColumnName("Rut")
                .HasMaxLength(10);

            // Teléfono opcional: solo lo ingresa el cliente (USU-002).
            entity.Property(user => user.PhoneNumber)
                .HasColumnName("Telefono");

            // Especialidad del técnico (USU-003).
            entity.Property(user => user.Specialty)
                .HasColumnName("Especialidad")
                .HasMaxLength(60);

            // El usuario queda habilitado por defecto (USU-003).
            // HasDefaultValue(true): los usuarios que ya existen también quedan habilitados.
            // HasSentinel(true): evita que EF ignore un "false" explícito al insertar.
            entity.Property(user => user.IsEnabled)
                .HasColumnName("Habilitado")
                .HasDefaultValue(true)
                .HasSentinel(true);

            // PasswordHash mantiene el mismo nombre en código y base de datos.
            entity.Property(user => user.PasswordHash)
                .HasColumnName("PasswordHash")
                .IsRequired();

            // RoleId corresponde a la columna IdRol en la base de datos.
            entity.Property(user => user.RoleId)
                .HasColumnName("IdRol")
                .IsRequired();

            // Índices únicos para correo electrónico y RUT.
            // En PostgreSQL un índice único admite varios NULL,
            // por lo que los técnicos sin RUT no generan conflicto.
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

                // Configuración del catálogo de tipos de equipo (ADM-001).
        modelBuilder.Entity<EquipmentType>(entity =>
        {
            entity.ToTable("EquipmentTypes");

            entity.HasKey(type => type.Id);

            entity.Property(type => type.Name)
                .HasMaxLength(60)
                .IsRequired();

            entity.Property(type => type.Description)
                .HasMaxLength(250);

            // Habilitado por defecto. HasSentinel(true) evita que EF ignore un "false" explícito.
            entity.Property(type => type.IsEnabled)
                .HasDefaultValue(true)
                .HasSentinel(true);

            // El nombre del tipo de equipo debe ser único (ADM-001).
            entity.HasIndex(type => type.Name)
                .IsUnique();
        });

        // Configuración de la orden de reparación (ORD-001).
        modelBuilder.Entity<RepairOrder>(entity =>
        {
            entity.ToTable("RepairOrders");

            entity.HasKey(order => order.Id);

            // El número de orden debe ser único (ORD-001).
            entity.HasIndex(order => order.OrderNumber)
                .IsUnique();

            entity.Property(order => order.BrandModel)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(order => order.SerialNumber)
                .HasMaxLength(60);

            entity.Property(order => order.ReportedFault)
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(order => order.Accessories)
                .HasMaxLength(250);

            // El estado se guarda como texto ("Received") para que la tabla sea legible.
            entity.Property(order => order.Status)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(order => order.ReceivedAt)
                .IsRequired();

            // Hay dos llaves foráneas hacia Usuarios (el cliente y quien registró),
            // por eso se declaran explícitamente. Restrict impide borrar un usuario con órdenes.
            entity.HasOne(order => order.Client)
                .WithMany()
                .HasForeignKey(order => order.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(order => order.RegisteredBy)
                .WithMany()
                .HasForeignKey(order => order.RegisteredById)
                .OnDelete(DeleteBehavior.Restrict);

            // Técnico responsable (opcional): se asigna en ORD-002 al abrir la orden para diagnosticar.
            entity.HasOne(order => order.ResponsibleTechnician)
                .WithMany()
                .HasForeignKey(order => order.ResponsibleTechnicianId)
                .OnDelete(DeleteBehavior.Restrict);

            // Restrict: no se puede borrar un tipo de equipo con órdenes (ADM-001 solo lo deshabilita).
            entity.HasOne(order => order.EquipmentType)
                .WithMany()
                .HasForeignKey(order => order.EquipmentTypeId)
                .OnDelete(DeleteBehavior.Restrict);

                // Datos del diagnóstico y presupuesto (ORD-002).
            entity.Property(order => order.TechnicalDiagnosis)
                .HasColumnType("character varying(2000)")
                .HasMaxLength(2000);

            entity.Property(order => order.LaborCost)
                .HasColumnType("numeric(12,2)")
                .HasPrecision(12, 2);

           entity.Property(order => order.PartsCost)
                .HasColumnType("numeric(12,2)")
                .HasPrecision(12, 2);

            entity.Property(order => order.TotalCost)
                .HasColumnType("numeric(12,2)")
                .HasPrecision(12, 2);
        });

        // Configuración de la bitácora de las órdenes.
        modelBuilder.Entity<OrderLog>(entity =>
        {
            entity.ToTable("OrderLogs");

            entity.HasKey(log => log.Id);

            entity.Property(log => log.PreviousStatus)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.Property(log => log.NewStatus)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(log => log.Comment)
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(log => log.CreatedAt)
                .IsRequired();

            // Si se borrara una orden, se borran sus eventos (Cascade).
            entity.HasOne(log => log.RepairOrder)
                .WithMany(order => order.Logs)
                .HasForeignKey(log => log.RepairOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(log => log.Responsible)
                .WithMany()
                .HasForeignKey(log => log.ResponsibleId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(modelBuilder);
    }
}