export function formatTicketmasterDateTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}
