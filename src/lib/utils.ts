export function cn(...inputs: Array<string | Record<string, boolean> | undefined | null>) {
  return inputs
    .flatMap((input) => {
      if (!input) return [] as string[];
      if (typeof input === "string") return input.split(" ");
      if (Array.isArray(input)) return input.flatMap((i) => (typeof i === "string" ? i.split(" ") : []));
      if (typeof input === "object") return Object.keys(input).filter((k) => (input as Record<string, boolean>)[k]);
      return [String(input)];
    })
    .filter(Boolean)
    .join(" ");
}
