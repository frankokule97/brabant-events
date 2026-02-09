export function toJsonLdScript(data: unknown) {
  return JSON.stringify(data, (_key, value) => {
    if (value === undefined || value === null) return undefined;
    return value;
  });
}
