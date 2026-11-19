import { getAllCollections } from "./collections"

/**
 * Corner stamp shown on every photo: capture date + category.
 *
 * The site ships no real EXIF data, so the stamp is derived deterministically
 * from the image path. Deterministic matters twice over: the same photo always
 * shows the same date (no flicker between renders), and the value is identical
 * on the server and the client, so React never reports a hydration mismatch
 * (a `new Date()` based stamp would differ across timezones).
 */
export interface PhotoStampInfo {
  /** Formatted as YYYY.MM.DD */
  date: string
  /** Short Chinese category label */
  category: string
  /** Tag the category was derived from (matches the filter bar vocabulary) */
  tag: string
  /** Accent colour for the category dot */
  color: string
}

interface CategoryStyle {
  label: string
  color: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Nature: { label: "自然", color: "#16a34a" },
  Landscape: { label: "风光", color: "#0d9488" },
  Mountains: { label: "山岳", color: "#7c3aed" },
  Urban: { label: "城市", color: "#2563eb" },
  Culture: { label: "人文", color: "#ea580c" },
  Architecture: { label: "建筑", color: "#0284c7" },
  Tropical: { label: "热带", color: "#ca8a04" },
  Winter: { label: "冬季", color: "#0891b2" },
  Desert: { label: "沙漠", color: "#d97706" },
  People: { label: "人像", color: "#db2777" },
  Street: { label: "街头", color: "#9333ea" },
  Coastal: { label: "海岸", color: "#0ea5e9" },
  "Pokémon": { label: "宝可梦", color: "#f59e0b" },
  Showreel: { label: "影像", color: "#e11d48" },
  Photography: { label: "摄影", color: "#475569" },
}

/**
 * Base shooting date per collection. Each photo then advances two days, which
 * spreads a collection across a plausible shooting window instead of stamping
 * 20 images with the same day.
 */
const COLLECTION_BASE_DATES: Record<string, string> = {
  "new-zealand": "2024-03-08",
  "tokyo": "2024-04-12",
  "bali": "2024-07-05",
  "iceland": "2025-02-18",
  "morocco": "2024-10-09",
  "urban-portraits": "2025-05-21",
  "santorini": "2025-06-14",
}

const POKEMON_BASE_DATE = "2025-08-16"
const VIDEO_DATE = "2026.11.12"

const FALLBACK: PhotoStampInfo = {
  date: "2025.06.01",
  category: CATEGORY_STYLES.Photography.label,
  tag: "Photography",
  color: CATEGORY_STYLES.Photography.color,
}

function styleFor(tag?: string): Pick<PhotoStampInfo, "category" | "tag" | "color"> {
  const key = tag && CATEGORY_STYLES[tag] ? tag : "Photography"
  const style = CATEGORY_STYLES[key]
  return { category: style.label, tag: key, color: style.color }
}

/** Adds whole days in UTC and formats the result as YYYY.MM.DD. */
function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number)
  const stamp = new Date(Date.UTC(year, month - 1, day) + days * 86_400_000)
  const yyyy = stamp.getUTCFullYear()
  const mm = String(stamp.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(stamp.getUTCDate()).padStart(2, "0")
  return `${yyyy}.${mm}.${dd}`
}

/** Strips the Next.js image query (``?height=800&width=1920``) and lowercases. */
function normalisePath(src: string): string {
  return src.split("?")[0].toLowerCase()
}

export function getPhotoStamp(src?: string | null): PhotoStampInfo {
  if (!src) return FALLBACK

  const path = normalisePath(src)

  // Showreel preview / poster
  if (path.includes("/video/")) {
    return { date: VIDEO_DATE, ...styleFor("Showreel") }
  }

  // Pokémon photographs live outside the collection folders
  const pokemon = path.match(/\/pokemon\/pokemon-(\d+)\.(?:jpe?g|png|webp)$/)
  if (pokemon) {
    return {
      date: addDays(POKEMON_BASE_DATE, Number(pokemon[1]) * 3),
      ...styleFor("Pokémon"),
    }
  }

  // Collection photos: derive the folder from each collection's cover path so
  // newly added collections are picked up without touching this file.
  for (const collection of getAllCollections()) {
    const folder = normalisePath(collection.coverImage).split("/")[1]
    if (!folder || !path.includes(`/${folder}/`)) continue

    const match = path.match(/-(\d+)\.(?:jpe?g|png|webp)$/)
    const index = match ? Number(match[1]) : 0
    const base = COLLECTION_BASE_DATES[collection.slug] ?? "2024-01-01"

    return {
      date: addDays(base, index * 2),
      ...styleFor(collection.tags[0]),
    }
  }

  return FALLBACK
}
