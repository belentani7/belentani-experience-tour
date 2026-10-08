export function isLocalGenerationRequest(address: string | undefined, host: string | undefined, origin: string | undefined): boolean {
  if (!address || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address) || !host) return false;
  try {
    const target = new URL(`http://${host}`);
    if (!['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) return false;
    if (!origin) return true;
    const source = new URL(origin);
    return ['http:', 'https:'].includes(source.protocol) && source.host === target.host;
  } catch { return false; }
}

export function generationArguments(query: Record<string, unknown>): string[] | null {
  const rawDays = query.days ?? '1';
  if (typeof rawDays !== 'string' || !/^\d+$/.test(rawDays)) return null;
  const days = Number(rawDays);
  if (!Number.isSafeInteger(days) || days < 1 || days > 31) return null;
  if (query.force !== undefined && query.force !== 'true' && query.force !== 'false') return null;
  return [...(days > 1 ? ['--days', String(days)] : []), ...(query.force === 'true' ? ['--force'] : [])];
}
