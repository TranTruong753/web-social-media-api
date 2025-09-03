const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
    try {
        return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
        console.log(error)
    }
}

export const comparePasswordHelper = async (plainPassword: string, hashPassword: string) => {
    try {
        return await bcrypt.compare(plainPassword, hashPassword);
    } catch (error) {
        console.log(error)
    }
}


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

