namespace TecnoFix.Src.Utils;

/// <summary>
/// Especialidades disponibles para registrar un técnico (USU-003).
/// Es la única fuente de la lista: el frontend la obtiene desde la API
/// y el backend la usa para validar el valor recibido.
/// La lista debe confirmarse por correo con el cliente.
/// </summary>
public static class TechnicianSpecialties
{
    /// <summary>
    /// Lista de especialidades, en el orden en que se despliegan.
    /// </summary>
    public static readonly IReadOnlyList<string> All =
    [
        "Computadores y notebooks",
        "Celulares y tablets",
        "Impresoras",
        "Consolas de videojuegos"
    ];

    /// <summary>
    /// Indica si la especialidad recibida pertenece a la lista.
    /// </summary>
    public static bool IsValid(string specialty) => All.Contains(specialty);
}