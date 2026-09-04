export function formatPrice(value: number): string {
  if (value === 0) return "Consulta";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}
