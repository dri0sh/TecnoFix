namespace TecnoFix.Src.Model;

/// <summary>
/// Tipo de equipo del catálogo (por ejemplo: notebook, impresora, teléfono).
/// El catálogo se gestiona en ADM-001. ORD-001 solo ofrece los tipos habilitados.
/// </summary>
public class EquipmentType
{
    /// <summary>
    /// Identificador único del tipo de equipo.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Nombre del tipo de equipo. Es obligatorio y único (ADM-001).
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Descripción opcional del tipo de equipo (ADM-001).
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Indica si el tipo de equipo se ofrece al registrar una orden.
    /// Un tipo no se elimina, solo se deshabilita (ADM-001).
    /// </summary>
    public bool IsEnabled { get; set; } = true;
}