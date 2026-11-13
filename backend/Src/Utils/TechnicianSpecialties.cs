namespace TecnoFix.Src.Utils;

/// <summary>
/// Especialidades iniciales de los técnicos (USU-003), aprobadas por el cliente.
/// El seeder las carga en la tabla Specialties; las nuevas se agregan desde la vista.
/// </summary>
public static class TechnicianSpecialties
{
    /// <summary>
    /// Lista de especialidades iniciales, en el orden en que se despliegan.
    /// </summary>
    public static readonly IReadOnlyList<string> All =
    [
        "Computadores y notebooks",
        "Celulares y tablets",
        "Impresoras",
        "Consolas de videojuegos"
    ];
}