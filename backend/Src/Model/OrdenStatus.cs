namespace TecnoFix.Src.Model;

/// <summary>
/// Estados por los que transita una orden de reparación, según la ERS:
/// Recibida → En diagnóstico → Presupuestada → En reparación → Lista para retiro → Entregada,
/// además de Rechazada (cuando el cliente no aprueba el presupuesto).
/// En el código van en inglés (estándar del equipo, NF04); al usuario se le muestran
/// en español con ToDisplayName(). Se guardan en la base de datos como texto (por ejemplo "Received").
/// </summary>
public enum OrderStatus
{
    /// <summary>Recibida</summary>
    Received,

    /// <summary>En diagnóstico</summary>
    InDiagnosis,

    /// <summary>Presupuestada</summary>
    Budgeted,

    /// <summary>En reparación</summary>
    InRepair,

    /// <summary>Lista para retiro</summary>
    ReadyForPickup,

    /// <summary>Entregada</summary>
    Delivered,

    /// <summary>Rechazada</summary>
    Rejected
}

/// <summary>
/// Conversión de los estados a los nombres exactos de la ERS, para mostrarlos al usuario.
/// </summary>
public static class OrderStatusExtensions
{
    /// <summary>
    /// Devuelve el nombre del estado tal como aparece en la ERS (por ejemplo «En diagnóstico»).
    /// </summary>
    public static string ToDisplayName(this OrderStatus status) => status switch
    {
        OrderStatus.Received => "Recibida",
        OrderStatus.InDiagnosis => "En diagnóstico",
        OrderStatus.Budgeted => "Presupuestada",
        OrderStatus.InRepair => "En reparación",
        OrderStatus.ReadyForPickup => "Lista para retiro",
        OrderStatus.Delivered => "Entregada",
        OrderStatus.Rejected => "Rechazada",
        _ => status.ToString()
    };
}