using TecnoFix.Src.DTO.Order;

namespace TecnoFix.Src.Services.Interfaces;

/// <summary>
/// Operaciones sobre las órdenes de reparación.
/// </summary>
public interface IRepairOrderService
{
    /// <summary>
    /// Entrega los listados del formulario de registrar orden:
    /// clientes registrados y tipos de equipo habilitados.
    /// </summary>
    Task<RepairOrderFormOptionsDto> GetFormOptionsAsync();

    /// <summary>
    /// Registra una nueva orden de reparación (ORD-001): genera el número de orden,
    /// asigna el estado «Recibida», guarda la fecha y hora y registra el primer evento en la bitácora.
    /// </summary>
    /// <param name="request">Datos ingresados en el formulario.</param>
    /// <param name="registeredById">Id del usuario que registra la orden (se obtiene del token).</param>
    Task<RepairOrderCreateResponseDto> RegisterOrderAsync(RepairOrderCreateRequestDto request, int registeredById);
}