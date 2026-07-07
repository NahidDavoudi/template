export function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  if (!source || typeof source !== 'object') return target;
  Object.keys(source).forEach((key) => {
    const srcVal = source[key];
    const tgtVal = (target as Record<string, unknown>)[key];
    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      deepMerge(tgtVal as Record<string, unknown>, srcVal as Record<string, unknown>);
    } else if (srcVal !== undefined) {
      (target as Record<string, unknown>)[key] = srcVal;
    }
  });
  return target;
}
