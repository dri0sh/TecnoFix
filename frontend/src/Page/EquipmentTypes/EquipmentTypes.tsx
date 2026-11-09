import { useEffect, useState, type FormEvent } from "react";
import {
    CreateEquipmentType,
    GetEquipmentTypes,
    SetEquipmentTypeStatus,
    UpdateEquipmentType
} from "../../Api/EquipmentType";
import { ApiError } from "../../Api/Client";
import type { EquipmentTypeDto } from "../../Types/EquipmentType";
import { ConfirmDialog } from "../../Components/ConfirmDialog/ConfirmDialog";
import "../RegisterTechnician/RegisterTechnician.css";
import "./EquipmentTypes.css";

type EquipmentTypeField = "name";

type FieldErrors = Partial<Record<EquipmentTypeField, string>>;

type ConfirmAction =
    | "create"
    | "update"
    | "enable"
    | "disable"
    | null;

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
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const [selectedType, setSelectedType] = useState<EquipmentTypeDto | null>(null);

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
        setSuccessMessage(null);
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
        setSuccessMessage(null);
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
    function HandleSubmit(event: FormEvent) {
        event.preventDefault();

        setFieldErrors({});
        setErrorMessage(null);
        setSuccessMessage(null);

        const cleanName = name.trim();

        const errors = ValidateForm(cleanName);

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setConfirmAction(editingId === null ? "create" : "update");
    }

    /**
     * Solicita confirmación para cambiar el estado de un tipo.
     */
    function HandleStatusChange(type: EquipmentTypeDto) {
        setSelectedType(type);
        setErrorMessage(null);
        setSuccessMessage(null);

        setConfirmAction(type.isEnabled ? "disable" : "enable");
    }

    /**
     * Ejecuta la operación previamente confirmada.
     */
    async function HandleConfirm() {
        if (!confirmAction) return;

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            if (confirmAction === "create") {
                const response = await CreateEquipmentType({
                    name: name.trim(),
                    description: description.trim() || null
                });

                setSuccessMessage(response.message || "Tipo de equipo registrado correctamente.");

                ResetForm();
                await LoadEquipmentTypes();
            }

            if (confirmAction === "update" && editingId !== null) {
                const response = await UpdateEquipmentType(editingId, {
                    name: name.trim(),
                    description: description.trim() || null
                });

                setSuccessMessage(response.message || "Tipo de equipo actualizado correctamente.");

                ResetForm();
                await LoadEquipmentTypes();
            }

            if ((confirmAction === "enable" || confirmAction === "disable") && selectedType !== null) {
                const isEnabled = confirmAction === "enable";

                const response = await SetEquipmentTypeStatus(selectedType.id, { isEnabled });

                setSuccessMessage(
                    response.message ||
                    (
                        isEnabled ? "Tipo de equipo habilitado correctamente." : "Tipo de equipo deshabilitado correctamente."
                    )
                );

                setSelectedType(null);
                await LoadEquipmentTypes();
            }
        } catch (error) {
            if (
                error instanceof ApiError &&
                Object.keys(error.fieldErrors).length > 0
            ) {
                setFieldErrors(error.fieldErrors as FieldErrors);
            } else {
                setErrorMessage(GetErrorMessage(error));
            }
        } finally {
            setIsSaving(false);
            setConfirmAction(null);
        }
    }

    /**
     * Cancela cualquier confirmación pendiente.
     */
    function HandleCancelConfirmation() {
        if (isSaving) return;

        setConfirmAction(null);
        setSelectedType(null);
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

    /** Obtiene el título de la confirmación actual. */
    function GetConfirmationTitle(): string {
        switch (confirmAction) {
            case "create":
                return "Registrar tipo de equipo";
            case "update":
                return "Guardar cambios";
            case "enable":
                return "Habilitar tipo de equipo";
            case "disable":
                return "Deshabilitar tipo de equipo";
            default:
                return "";
        }
    }

    /** Obtiene el mensaje de la confirmación actual. */
    function GetConfirmationMessage(): string {
        if (confirmAction === "create") {
            return `¿Estás seguro de que deseas registrar el tipo de equipo "${name.trim()}"?`;
        }

        if (confirmAction === "update") {
            return `¿Estás seguro de que deseas guardar los cambios del tipo de equipo "${name.trim()}"?`;
        }

        if (
            (confirmAction === "enable" || confirmAction === "disable") && selectedType !== null) 
            {
            const action = confirmAction === "enable" ? "habilitar" : "deshabilitar";

            return `¿Estás seguro de que deseas ${action} el tipo de equipo "${selectedType.name}"?`;
        }

        return "";
    }

    /** Texto del botón de confirmación. */
    function GetConfirmationButtonText(): string {
        switch (confirmAction) {
            case "create":
                return "Registrar";
            case "update":
                return "Guardar cambios";
            case "enable":
                return "Habilitar";
            case "disable":
                return "Deshabilitar";
            default:
                return "Confirmar";
        }
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

                {successMessage && (
                    <p className="formPage__success" role="status">
                        {successMessage}
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

                                {fieldErrors.name && (
                                    <p
                                        className="formPage__fieldError"
                                        role="alert"
                                    >
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
                            </div>

                            <button
                                type="submit"
                                className="formPage__button"
                                disabled={isSaving}
                            >
                                {editingId === null
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
                                <h2 className="equipmentTypesPage__sectionTitle">
                                    Catálogo
                                </h2>

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
                                                            onClick={() =>
                                                                HandleStatusChange(type)
                                                            }
                                                            disabled={isSaving}
                                                        >
                                                            {type.isEnabled
                                                                ? "Deshabilitar"
                                                                : "Habilitar"}
                                                        </button>
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

            <ConfirmDialog
                isOpen={confirmAction !== null}
                title={GetConfirmationTitle()}
                message={GetConfirmationMessage()}
                confirmText={GetConfirmationButtonText()}
                cancelText="Cancelar"
                isLoading={isSaving}
                variant={
                    confirmAction === "disable"
                        ? "danger"
                        : "primary"
                }
                onConfirm={HandleConfirm}
                onCancel={HandleCancelConfirmation}
            />
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