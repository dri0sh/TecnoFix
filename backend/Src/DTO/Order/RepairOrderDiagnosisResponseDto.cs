
namespace TecnoFix.Src.DTO.Order;

/// <summary>
/// Resultado del registro del diagnóstico y presupuesto (ORD-002).
/// </summary>
public class RepairOrderDiagnosisResponseDto
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Errores de validación asociados a cada campo.
    /// </summary>
    public Dictionary<string, string> FieldErrors { get; set; } = [];
}
