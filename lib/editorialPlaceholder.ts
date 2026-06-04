export type EdType = "spotlight" | "celebrates" | "collect";

export function editorialPlaceholder(edType: EdType): string {
  switch (edType) {
    case "spotlight":  return "/spotlight.webp";
    case "celebrates": return "/celebrate.webp";
    case "collect":    return "/collect.webp";
  }
}