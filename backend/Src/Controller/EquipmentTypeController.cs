using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TecnoFix.Src.DTO.EquipmentType;
using TecnoFix.Src.Services.Interfaces;

namespace TecnoFix.Src.Controller;

/// <summary>
/// Controlador para la gestión del catálogo de tipos de equipo (ADM-001).
/// </summary>
/// <param name="equipmentTypeService">Servicio del catálogo inyectado.</param>
[ApiController]
[Route("api/equipment-types")]
[Authorize(Roles = "Administrador")]
public class EquipmentTypeController(IEquipmentTypeService equipmentTypeService) : ControllerBase
{
    private readonly IEquipmentTypeService _equipmentTypeService = equipmentTypeService;

    /// <summary>
    /// Obtiene todos los tipos de equipo registrados.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<EquipmentTypeDto>>> GetAll()
    {
        return Ok(await _equipmentTypeService.GetAllAsync());
    }

    /// <summary>
    /// Registra un nuevo tipo de equipo habilitado.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EquipmentTypeRequestDto request)
    {
        var result = await _equipmentTypeService.CreateAsync(request);

        if (result.Success)
        {
            return Ok(new
            {
                message = result.Message,
                equipmentType = result.EquipmentType
            });
        }

        var errorBody = new
        {
            message = result.Message,
            fieldErrors = result.FieldErrors
        };

        return result.IsDuplicateName ? Conflict(errorBody) : BadRequest(errorBody);
    }

    /// <summary>
    /// Edita el nombre y la descripción de un tipo de equipo.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] EquipmentTypeRequestDto request)
    {
        var result = await _equipmentTypeService.UpdateAsync(id, request);

        if (result.Success)
        {
            return Ok(new
            {
                message = result.Message,
                equipmentType = result.EquipmentType
            });
        }

        if (result.IsNotFound)
        {
            return NotFound(new
            {
                message = result.Message
            });
        }

        var errorBody = new
        {
            message = result.Message,
            fieldErrors = result.FieldErrors
        };

        return result.IsDuplicateName ? Conflict(errorBody) : BadRequest(errorBody);
    }

    /// <summary>
    /// Habilita o deshabilita un tipo de equipo.
    /// </summary>
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetEnabled(
        int id,
        [FromBody] EquipmentTypeStatusRequestDto request)
    {
        var result = await _equipmentTypeService.SetEnabledAsync(id, request.IsEnabled);

        if (result.Success)
        {
            return Ok(new
            {
                message = result.Message,
                equipmentType = result.EquipmentType
            });
        }

        if (result.IsNotFound)
        {
            return NotFound(new
            {
                message = result.Message
            });
        }

        if (result.HasOrdersInProgress)
        {
            return Conflict(new
            {
                message = result.Message
            });
        }

        return BadRequest(new
        {
            message = result.Message
        });
    }
}