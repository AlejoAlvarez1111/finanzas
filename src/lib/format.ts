const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Formatea un monto entero en pesos colombianos, por ejemplo $1.250.000. */
export function formatCOP(amount: number): string {
  return cop.format(amount).replace(/\s/g, "");
}