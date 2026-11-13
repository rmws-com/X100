import type { Collection, Photo } from "./types"

// Collection format mapping
const collectionFormats: Record<string, string> = {
  'bali': 'jpeg',
  'morocco': 'webp',
  'tokyo': 'jpg',
  'new-zealand': 'jpg',
  'iceland': 'jpg',
  'urban-portraits': 'jpg',
  'santorini': 'jpg'
} as const

// Collection folder name mapping (for case sensitivity)
const collectionFolders: Record<string, string> = {
  'bali': 'Bali',
  'morocco': 'Morocco',
  'tokyo': 'Tokyo',
  'new-zealand': 'new zealand',
  'iceland': 'Iceland',
  'urban-portraits': 'Urban Portraits',
  'santorini': 'Santorini'
} as const

// Collection image counts and formats
const collectionImages: Record<string, { count: number; formats: string[] }> = {
  'bali': { 
    count: 16,
    formats: ['jpeg', 'jpg']
  },
  'morocco': { 
    count: 21,
    formats: ['webp']
  },
  'tokyo': { 
    count: 20,
    formats: ['jpg']
  },
  'new-zealand': { 
    count: 18,
    formats: ['jpg']
  },
  'iceland': { 
    count: 14,
    formats: ['jpg']
  },
  'urban-portraits': { 
    count: 16,
    formats: ['jpg']
  },
  'santorini': {
    count: 12,
    formats: ['jpg']
  }
} as const

// Common metadata for photos
const defaultMetadata = {
  camera: "Sony Alpha A7 IV",
  lens: "24-70mm f/2.8",
  aperture: "f/8.0",
  shutterSpeed: "1/250",
  iso: "100",
  focalLength: "35mm",
  takenAt: new Date().toISOString().split("T")[0],
} as const

// Aspect ratios for different image types
const aspectRatios = [
  { width: 1800, height: 1200 }, // 3:2
  { width: 1800, height: 1350 }, // 4:3
  { width: 1800, height: 1080 }, // 16:9
  { width: 1200, height: 1800 }, // 2:3 (portrait)
] as const

// Real pixel dimensions for photos whose actual file ratio differs from the
// placeholder ratios above. Keyed by collection slug, then 1-based index.
// Without this the masonry layout crops non-standard images via object-fit: cover.
const photoDimensionOverrides: Record<string, Record<number, { width: number; height: number }>> = {
  'tokyo': {
    2: { width: 350, height: 350 },
    3: { width: 614, height: 614 },
    4: { width: 1080, height: 1094 },
    5: { width: 350, height: 350 },
  },
  'santorini': {
    1: { width: 1920, height: 1280 },
    2: { width: 1920, height: 1280 },
    3: { width: 1920, height: 1280 },
    4: { width: 1920, height: 1280 },
    5: { width: 1920, height: 1440 },
    6: { width: 1920, height: 1280 },
    7: { width: 1920, height: 1282 },
    8: { width: 1920, height: 1080 },
    9: { width: 1920, height: 1282 },
    10: { width: 1731, height: 1155 },
    11: { width: 1920, height: 1440 },
    12: { width: 1920, height: 2880 },
  },
}

// Featured photo indexes per collection (1-based). Marked with a star badge
// in the gallery and shown in the "Featured Photos" section on the homepage.
const featuredPhotoIndexes: Record<string, Set<number>> = {
  'tokyo': new Set([2, 3, 4, 5]),
}

// Function to get images for a collection
function getCollectionImages(collectionSlug: string): Photo[] {
  // Get the proper folder name from our mapping instead of generating it
  const folderName = collectionFolders[collectionSlug]
  if (!folderName) return []

  const collectionInfo = collectionImages[collectionSlug]
  if (!collectionInfo) return []
  
  return Array.from({ length: collectionInfo.count }, (_, i) => {
    const index = i + 1
    const format = collectionSlug === 'bali' && index >= 10 && index <= 15 ? 'jpg' : collectionFormats[collectionSlug]
    const imagePath = `/${folderName}/${collectionSlug}-${index}.${format}`
    const dimensions =
      photoDimensionOverrides[collectionSlug]?.[index] ?? aspectRatios[index % aspectRatios.length]

    return {
      id: `${collectionSlug}-${index}`,
      src: imagePath,
      width: dimensions.width,
      height: dimensions.height,
      alt: `${collectionSlug} image ${index}`,
      metadata: defaultMetadata,
      featured: featuredPhotoIndexes[collectionSlug]?.has(index) ?? false,
    }
  })
}

// Function to get cover image path
function getCoverImagePath(folderName: string): string {
  const collectionSlug = folderName.toLowerCase().replace(' ', '-')
  const format = collectionFormats[collectionSlug] || 'jpg'
  return `/${folderName}/cover.${format}`
}

// Collections data
const collections: Collection[] = [
  {
    id: "1",
    slug: "new-zealand",
    title: "New Zealand Landscapes",
    description: "Breathtaking landscapes from across New Zealand",
    fullDescription:
      "New Zealand offers some of the most diverse and dramatic landscapes in the world. From the snow-capped Southern Alps to the pristine beaches of the Coromandel Peninsula, this collection captures the raw beauty and majesty of Aotearoa.",
    coverImage: getCoverImagePath("new zealand"),
    tags: ["Nature", "Landscape", "Mountains"],
    featured: true,
    photos: getCollectionImages("new-zealand"),
  },
  {
    id: "2",
    slug: "tokyo",
    title: "Japan: Urban & Traditional",
    description: "The contrast between modern and traditional Japan",
    fullDescription:
      "Japan presents a fascinating juxtaposition of ultramodern urban environments and serene traditional settings. This collection explores the visual dialogue between Tokyo's neon-lit streets and the tranquil temples of Kyoto, capturing Japan's unique cultural identity.",
    coverImage: getCoverImagePath("Tokyo"),
    tags: ["Urban", "Culture", "Architecture"],
    featured: true,
    photos: getCollectionImages("tokyo"),
  },
  {
    id: "3",
    slug: "bali",
    title: "Bali: Island of the Gods",
    description: "Tropical paradise and cultural heritage of Bali",
    fullDescription:
      "Known as the Island of the Gods, Bali captivates with its dramatic landscapes, vibrant cultural heritage, and spiritual atmosphere. This collection documents the island's terraced rice fields, ancient temples, pristine beaches, and the warmth of Balinese people.",
    coverImage: getCoverImagePath("Bali"),
    tags: ["Tropical", "Culture", "Nature"],
    featured: true,
    photos: getCollectionImages("bali"),
  },
  {
    id: "4",
    slug: "iceland",
    title: "Iceland: Land of Fire and Ice",
    description: "Dramatic landscapes of Iceland",
    fullDescription:
      "Iceland's otherworldly landscapes showcase nature's raw power and beauty. This collection captures the country's dramatic contrasts: steaming geothermal areas alongside massive glaciers, thundering waterfalls cutting through black lava fields, and the ethereal Northern Lights dancing above it all.",
    coverImage: getCoverImagePath("Iceland"),
    tags: ["Nature", "Landscape", "Winter"],
    featured: false,
    photos: getCollectionImages("iceland"),
  },
  {
    id: "5",
    slug: "morocco",
    title: "Colors of Morocco",
    description: "Vibrant markets, architecture, and desert landscapes",
    fullDescription:
      "Morocco is a feast for the senses, with its vibrant colors, intricate patterns, and diverse landscapes. This collection explores the bustling medinas, ancient kasbahs, vast Sahara dunes, and the rich cultural tapestry that makes Morocco so visually captivating.",
    coverImage: getCoverImagePath("Morocco"),
    tags: ["Culture", "Desert", "Architecture"],
    featured: false,
    photos: getCollectionImages("morocco"),
  },
  {
    id: "6",
    slug: "urban-portraits",
    title: "Urban Portraits",
    description: "Street photography and urban life around the world",
    fullDescription:
      "This collection focuses on the human element within urban environments. Through candid street photography and environmental portraits, it captures the diversity, energy, and stories of city dwellers across different cultures and metropolises around the world.",
    coverImage: getCoverImagePath("Urban Portraits"),
    tags: ["Urban", "People", "Street"],
    featured: false,
    photos: getCollectionImages("urban-portraits"),
  },
  {
    id: "7",
    slug: "santorini",
    title: "Santorini: White & Blue",
    description: "Whitewashed villages perched above the Aegean caldera",
    fullDescription:
      "Santorini is defined by a single, unbroken palette: chalk-white walls, cobalt domes, and the deep blue of the Aegean below. This collection follows the cliffside lanes of Oia and Fira, where cave houses are carved into volcanic rock and every terrace frames the caldera.",
    coverImage: getCoverImagePath("Santorini"),
    tags: ["Coastal", "Architecture", "Culture"],
    featured: false,
    photos: getCollectionImages("santorini"),
  },
]

// Export functions
export const getAllCollections = (): Collection[] => collections
export const getFeaturedCollections = (): Collection[] => collections.filter(collection => collection.featured)
export const getCollection = (slug: string): Collection | undefined => collections.find(collection => collection.slug === slug)
export const getAllTags = (): string[] => Array.from(new Set(collections.flatMap(collection => collection.tags)))
export const getFeaturedPhotos = (): { photo: Photo; collection: Collection }[] =>
  collections.flatMap(collection =>
    collection.photos.filter(photo => photo.featured).map(photo => ({ photo, collection }))
  )
