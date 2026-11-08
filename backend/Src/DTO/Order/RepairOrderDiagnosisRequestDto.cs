using System.ComponentModel.DataAnnotations;

namespace TecnoFix.Src.DTO.Order;

/// <summary>
/// Datos ingresados por el técnico para registrar el diagnóstico y presupuesto.
/// </summary>
public class RepairOrderDiagnosisRequestDto
{
    /// <summary>
    /// Identificador de la orden de reparación.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo de la orden.")]
    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar una orden válida.")]
    public int OrderId { get; set; }

    /// <summary>
    /// Diagnóstico técnico realizado por el técnico.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo del diagnóstico técnico.")]
    [StringLength(2000, ErrorMessage = "El diagnóstico técnico no puede superar los 2000 caracteres.")]
    public string TechnicalDiagnosis { get; set; } = string.Empty;

    /// <summary>
    /// Costo de mano de obra.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo del costo de mano de obra.")]
    [Range(typeof(decimal), "0", "9999999999.99",
        ParseLimitsInInvariantCulture = true,
        ErrorMessage = "El costo ingresado no es válido")]
    public decimal? LaborCost { get; set; }

    /// <summary>
    /// Costo de repuestos.
    /// </summary>
    [Required(ErrorMessage = "Debe completar el campo del costo de repuestos.")]
    [Range(typeof(decimal), "0", "9999999999.99",
        ParseLimitsInInvariantCulture = true,
        ErrorMessage = "El costo ingresado no es válido")]
    public decimal? PartsCost { get; set; }
}
