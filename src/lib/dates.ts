/** Fecha de hoy en Colombia, con formato AAAA-MM-DD. */
export function todayInBogota(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}