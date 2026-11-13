namespace TecnoFix.Src.Model;

/// <summary>
/// Especialidad que puede tener un técnico (USU-003).
/// Las 4 iniciales se cargan con el seeder y el administrador puede agregar nuevas.
/// </summary>
public class Specialty
{
    /// <summary>
    /// Identificador único de la especialidad.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Nombre de la especialidad. Es obligatorio y único.
    /// </summary>
    public string Name { get; set; } = string.Empty;
}