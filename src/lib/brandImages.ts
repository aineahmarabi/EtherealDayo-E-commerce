/**
 * Maps a brand slug to a local silhouette/logo image path.
 * Returns null if no custom image is available (falls back to letter monogram).
 */
export const BRAND_IMAGES: Record<string, string> = {
  "lattafa":          "/brands/lattafa.jpg",
  "fragrance-world":  "/brands/fragrance-world.jpg",
  "french-avenue":    "/brands/french-avenue.jpg",
  "rave":             "/brands/rave.jpg",
  "maison-alhambra":  "/brands/maison-alhambra.jpg",
  "ard-al-zaafaran":  "/brands/ard-al-zaafaran.jpg",
  "maison-noir":      "/brands/maison-noir.jpg",
  "maisonnoirbrand":  "/brands/maison-noir.jpg",
};

export function getBrandImage(slug: string): string | null {
  return BRAND_IMAGES[slug] ?? null;
}
