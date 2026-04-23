import { prisma } from "./prisma";
import { SETTING_KEYS } from "./setting-keys";

export { SETTING_KEYS };

/**
 * Server-only helper to read a setting value with fallback.
 * Returns empty string if not set or DB unreachable.
 */
export async function getSetting(key: string): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? "";
  } catch {
    return "";
  }
}

/**
 * Batch-read multiple settings keys. Returns a Record mapping key → value.
 */
export async function getSettings<K extends string>(keys: K[]): Promise<Record<K, string>> {
  const out = {} as Record<K, string>;
  for (const k of keys) out[k] = "";
  try {
    const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
    for (const r of rows) {
      if ((keys as string[]).includes(r.key)) (out as any)[r.key] = r.value;
    }
  } catch {}
  return out;
}
