export const partialKeyMatcher = <T>(results: {[p: string]: T}, partialKey: string) =>
  Object.keys(results).find((key) => key.includes(partialKey));
