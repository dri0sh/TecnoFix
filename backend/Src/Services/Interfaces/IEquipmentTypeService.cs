using TecnoFix.Src.DTO.EquipmentType;

namespace TecnoFix.Src.Services.Interfaces;

/// <summary>
/// Operaciones de gestión del catálogo de tipos de equipo (ADM-001).
/// </summary>
public interface IEquipmentTypeService
{
    /// <summary>
    /// Obtiene todos los tipos de equipo registrados, tanto habilitados como deshabilitados.
    /// </summary>
    Task<List<EquipmentTypeDto>> GetAllAsync();

    /// <summary>
    /// Registra un nuevo tipo de equipo habilitado.
    /// </summary>
    Task<EquipmentTypeOperationResponseDto> CreateAsync(EquipmentTypeRequestDto request);

    /// <summary>
    /// Edita el nombre y la descripción de un tipo de equipo existente.
    /// </summary>
    Task<EquipmentTypeOperationResponseDto> UpdateAsync(int id, EquipmentTypeRequestDto request);

    /// <summary>
    /// Habilita o deshabilita un tipo de equipo.
    /// </summary>
    Task<EquipmentTypeOperationResponseDto> SetEnabledAsync(int id, bool isEnabled);
}