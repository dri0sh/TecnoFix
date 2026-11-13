import { useEffect, useState, type FormEvent } from "react";
import {
    CreateEquipmentType,
    GetEquipmentTypes,
    SetEquipmentTypeStatus,
    UpdateEquipmentType
} from "../../Api/EquipmentType";
import { ApiError } from "../../Api/Client";
import {
    ConfirmAction,
    ShowError,
    ShowSuccessToast
} from "../../Utils/Alert";
import type { EquipmentTypeDto } from "../../Types/EquipmentType";
import "../RegisterTechnician/RegisterTechnician.css";
import "./EquipmentTypes.css";

type EquipmentTypeField = "name";

type FieldErrors = Partial<Record<EquipmentTypeField, string>>;

const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta nuevamente.";

/**
 * Vista para administrar el catálogo de tipos de equipo (ADM-001).
 * Permite registrar, editar, habilitar y deshabilitar tipos de equipo.
 */
export function EquipmentTypes() {
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeDto[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {LoadEquipmentTypes();}, []);

    /**
     * Obtiene todos los tipos de equipo, incluidos los deshabilitados.
     */
    async function LoadEquipmentTypes() {
        setIsLoading(true);

        try {
            const response = await GetEquipmentTypes();
            setEquipmentTypes(response);
        } catch (error) {
            setErrorMessage(GetErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Valida los datos básicos del formulario.
     */
    function ValidateForm(cleanName: string): FieldErrors {
        const errors: FieldErrors = {};

        if (cleanName === "") {
            errors.name = "Debe completar el campo Nombre";
        }

        return errors;
    }

    /**
     * Prepara el formulario para registrar un nuevo tipo.
     */
    function HandleNewType() {
        ResetForm();
        setErrorMessage(null);
    }

    /**
     * Carga un tipo existente en el formulario para editarlo.
     */
    function HandleEdit(type: EquipmentTypeDto) {
        setEditingId(type.id);
        setName(type.name);
        setDescription(type.description ?? "");

        setFieldErrors({});
        setErrorMessage(null);
    }

    /**
     * Cancela la edición actual y vuelve al formulario de registro.
     */
    function HandleCancelEdit() {
        ResetForm();
        setErrorMessage(null);
    }

    /**
     * Valida el formulario y solicita confirmación antes de guardar.
     */
    async function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        setFieldErrors({});
        setErrorMessage(null);

        const cleanName = name.trim();
        const cleanDescription = description.trim();

        const errors = ValidateForm(cleanName);

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        const isEditing = editingId !== null;

        const confirmed = await ConfirmAction(
            isEditing ? "Se actualizará el tipo de equipo con los siguientes datos:"
                : "Se registrará el tipo de equipo con los siguientes datos:",
            {
                "Nombre": cleanName,
                "Descripción": cleanDescription || "No informada"
            }
        );

        if (!confirmed) {
            return;
        }
    
        setIsSaving(true);

        try {
            if (editingId === null) {
                const response = await CreateEquipmentType({
                    name: cleanName,
                    description: cleanDescription || null
                });

                ResetForm();
                await LoadEquipmentTypes();

                void ShowSuccessToast(
                    response.message || "Tipo de equipo registrado correctamente."
                );
            } else {
                const response = await UpdateEquipmentType(editingId, {
                    name: cleanName,
                    description: cleanDescription || null
                });

                ResetForm();
                await LoadEquipmentTypes();

                void ShowSuccessToast(
                    response.message || "Tipo de equipo actualizado correctamente."
                );
            }
        } catch (error) {
            if (
                error instanceof ApiError &&
                Object.keys(error.fieldErrors).length > 0
            ) {
                setFieldErrors(error.fieldErrors as FieldErrors);
            } else {
                await ShowError(GetErrorMessage(error));
            }
        } finally {
            setIsSaving(false);
        }
    }

    /**
     * Solicita confirmación para cambiar el estado de un tipo.
     */
    async function HandleStatusChange(type: EquipmentTypeDto) {
        const isEnabling = !type.isEnabled;
        const action = isEnabling ? "habilitar" : "deshabilitar";

        setErrorMessage(null);

        const confirmed = await ConfirmAction(`Se procederá a ${action} el tipo de equipo "${type.name}".`,
        {
            "Tipo de equipo": type.name,
            "Estado actual": type.isEnabled ? "Habilitado" : "Deshabilitado"
        });

        if (!confirmed) {
            return;
        }

        setIsSaving(true);

        try {
            const response = await SetEquipmentTypeStatus(
                type.id,
                {
                    isEnabled: isEnabling
                }
            );

            await LoadEquipmentTypes();

            void ShowSuccessToast(
                response.message ||
                (
                    isEnabling ? "Tipo de equipo habilitado correctamente."
                    : "Tipo de equipo deshabilitado correctamente."
                )
            );
        } catch (error) {
            await ShowError(GetErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    /**
     * Limpia los datos del formulario y termina cualquier edición.
     */
    function ResetForm() {
        setName("");
        setDescription("");
        setEditingId(null);
        setFieldErrors({});
    }

    /** Clase del campo según su estado de validación. */
    function InputClass(field: EquipmentTypeField): string {
        return ("formPage__input" + (fieldErrors[field] ? " formPage__input--invalid" : ""));
    }

    return (
        <div className="equipmentTypesPage">
            <main className="equipmentTypesPage__content">
                <header className="equipmentTypesPage__header">
                    <div>
                        <h1 className="formPage__title">
                            Tipos de equipo
                        </h1>

                        <p className="formPage__subtitle">
                            Administra el catálogo de tipos de equipo disponibles
                            para las órdenes de reparación.
                        </p>
                    </div>

                    {editingId !== null && (
                        <button
                            type="button"
                            className="equipmentTypesPage__newButton"
                            onClick={HandleNewType}
                            disabled={isSaving}
                        >
                            Nuevo tipo
                        </button>
                    )}
                </header>

                {errorMessage && (
                    <p className="formPage__error" role="alert">
                        {errorMessage}
                    </p>
                )}

                <div className="equipmentTypesPage__layout">
                    <section className="equipmentTypesPage__formSection">
                        <h2 className="equipmentTypesPage__sectionTitle">
                            {editingId === null
                                ? "Registrar tipo"
                                : "Editar tipo"}
                        </h2>

                        <p className="equipmentTypesPage__sectionDescription">
                            {editingId === null
                                ? "Ingresa los datos del nuevo tipo de equipo."
                                : "Modifica el nombre o la descripción del tipo de equipo."}
                        </p>

                        <form
                            className="formPage__form"
                            onSubmit={HandleSubmit}
                            noValidate
                        >
                            <div className="formPage__field">
                                <label
                                    className="formPage__label"
                                    htmlFor="equipmentTypeName"
                                >
                                    Nombre
                                </label>

                                <div className="equipmentTypesPage__fieldControl">
                                    <input
                                        id="equipmentTypeName"
                                        type="text"
                                        className={InputClass("name")}
                                        value={name}
                                        onChange={(event) =>
                                            setName(event.target.value)
                                        }
                                    placeholder="Ej: Consola de videojuegos."
                                    maxLength={60}
                                    aria-invalid={Boolean(fieldErrors.name)}
                                    />

                                    <span className="formPage__help">
                                        <button
                                            type="button"
                                            className="formPage__helpButton"
                                            aria-describedby="equipmentTypeNameHelp"
                                            aria-label="Ayuda: nombre del tipo de equipo"
                                        >
                                            ?
                                        </button>

                                        <span
                                            id="equipmentTypeNameHelp"
                                            className="formPage__helpText"
                                            role="tooltip"
                                        >
                                            El nombre es obligatorio y admite hasta 60 caracteres.
                                            No distingue entre mayúsculas y minúsculas:
                                            Notebook y noTEbook se consideran el mismo nombre.
                                        </span>
                                    </span>
                                </div>

                                {fieldErrors.name && (
                                <p className="formPage__fieldError" role="alert">
                                    {fieldErrors.name}
                                </p>
                                )}
                            </div>

                            <div className="formPage__field">
                                <label
                                    className="formPage__label"
                                    htmlFor="equipmentTypeDescription"
                                >
                                    Descripción
                                </label>

                                <div className="equipmentTypesPage__fieldControl equipmentTypesPage__fieldControl--textarea">
                                    <textarea
                                        id="equipmentTypeDescription"
                                        className="equipmentTypesPage__textarea"
                                        value={description}
                                        onChange={(event) =>
                                            setDescription(event.target.value)
                                        }
                                    placeholder="Descripción opcional del tipo de equipo."
                                    maxLength={250}
                                    rows={5}
                                />

                                    <span className="formPage__help">
                                        <button
                                            type="button"
                                            className="formPage__helpButton"
                                            aria-describedby="equipmentTypeDescriptionHelp"
                                            aria-label="Ayuda: descripción del tipo de equipo"
                                        >
                                            ?
                                        </button>

                                        <span
                                            id="equipmentTypeDescriptionHelp"
                                            className="formPage__helpText"
                                            role="tooltip"
                                        >
                                            Campo opcional. Admite hasta 250 caracteres.
                                        </span>
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                className="formPage__button"
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? "Procesando..."
                                    : editingId === null
                                        ? "Registrar tipo"
                                        : "Guardar cambios"}
                            </button>

                            {editingId !== null && (
                                <button
                                    type="button"
                                    className="equipmentTypesPage__cancelButton"
                                    onClick={HandleCancelEdit}
                                    disabled={isSaving}
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </form>
                    </section>

                    <section className="equipmentTypesPage__catalogSection">
                        <div className="equipmentTypesPage__catalogHeader">
                            <div>
                                <div className="equipmentTypesPage__labelWithHelp">
                                    <h2 className="equipmentTypesPage__sectionTitle">
                                        Catálogo
                                    </h2>

                                    <span className="formPage__help">
                                        <button
                                            type="button"
                                            className="formPage__helpButton"
                                            aria-describedby="equipmentTypesCatalogHelp"
                                            aria-label="Ayuda: catálogo de tipos de equipo"
                                        >
                                            ?
                                        </button>

                                        <span
                                            id="equipmentTypesCatalogHelp"
                                            className="formPage__helpText"
                                            role="tooltip"
                                        >
                                            Los tipos deshabilitados no estarán disponibles
                                            para nuevas órdenes, pero seguirán asociados
                                            a las órdenes existentes.
                                        </span>
                                    </span>
                                </div>

                                <p className="equipmentTypesPage__sectionDescription">
                                    Los tipos deshabilitados permanecen registrados
                                    y pueden volver a habilitarse.
                                </p>
                            </div>

                            <span className="equipmentTypesPage__count">
                                {equipmentTypes.length}
                            </span>
                        </div>

                        {isLoading ? (
                            <p className="equipmentTypesPage__loading">
                                Cargando tipos de equipo...
                            </p>
                        ) : equipmentTypes.length === 0 ? (
                            <p className="equipmentTypesPage__empty">
                                No hay tipos de equipo registrados.
                            </p>
                        ) : (
                            <div className="equipmentTypesPage__tableWrapper">
                                <table className="equipmentTypesPage__table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {equipmentTypes.map((type) => (
                                            <tr key={type.id}>
                                                <td className="equipmentTypesPage__nameCell">
                                                    {type.name}
                                                </td>

                                                <td>
                                                    {type.description || "—"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            "equipmentTypesPage__status " +
                                                            (
                                                                type.isEnabled
                                                                    ? "equipmentTypesPage__status--enabled"
                                                                    : "equipmentTypesPage__status--disabled"
                                                            )
                                                        }
                                                    >
                                                        {type.isEnabled
                                                            ? "Habilitado"
                                                            : "Deshabilitado"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="equipmentTypesPage__actions">
                                                        <button
                                                            type="button"
                                                            className="equipmentTypesPage__actionButton"
                                                            onClick={() =>
                                                                HandleEdit(type)
                                                            }
                                                            disabled={isSaving}
                                                        >
                                                            Editar
                                                        </button>

                                                        <span className="formPage__help">
                                                            <button
                                                                type="button"
                                                                className={
                                                                    "equipmentTypesPage__actionButton " +
                                                                    (
                                                                        type.isEnabled
                                                                            ? "equipmentTypesPage__actionButton--danger"
                                                                            : "equipmentTypesPage__actionButton--primary"
                                                                    )
                                                                }
                                                                onClick={() => HandleStatusChange(type)}
                                                                disabled={isSaving}
                                                                aria-describedby={
                                                                    type.isEnabled
                                                                        ? `equipmentTypeDisableHelp-${type.id}`
                                                                        : undefined
                                                                }
                                                            >
                                                                {type.isEnabled ? "Deshabilitar" : "Habilitar"}
                                                            </button>

                                                            {type.isEnabled && (
                                                                <span
                                                                    id={`equipmentTypeDisableHelp-${type.id}`}
                                                                    className="formPage__helpText"
                                                                    role="tooltip"
                                                                >
                                                                    No es posible deshabilitar un tipo de equipo que
                                                                    tenga órdenes en estados distintos de Entregada.
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

/** Convierte cualquier error en un mensaje para el usuario. */
function GetErrorMessage(error: unknown): string {
    if (error instanceof Error && !(error instanceof TypeError)) {
        return error.message;
    }

    return CONNECTION_ERROR_MESSAGE;
}