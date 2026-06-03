declare module 'fast-levenshtein' {
  export const levenshtein: {
    get(a: string, b: string, options?: { threshold?: number }): number;
  };
  export { levenshtein as default };
}