export function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}

export function cleanObjectPlus<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned = Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== null && v !== undefined)
      .map(([k, v]) => [
        k,
        typeof v === 'object' && !Array.isArray(v) ? cleanObject(v) : v,
      ])
  );

  return cleaned as Partial<T>;
}
