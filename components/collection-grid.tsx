"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Move3d } from "lucide-react"
import { getAllCollections } from "@/lib/collections"
import { getPokemonShot, showcasePokemonBySlug } from "@/lib/pokemon"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useShutterSound } from "./sound-effects"
import LiftCard, { type LiftCardData } from "./lift-card"
import type { Collection } from "@/lib/types"

// Same rainbow palette as the home-page rails so every card shares a look
const RAINBOW =
  "conic-gradient(from 0deg, #ff4d6d, #ffb703, #52e5a3, #38bdf8, #a855f7, #ff4d6d)"

/**
 * Collections use a Pokémon photograph as their cover. Entries missing from
 * the map fall back to the collection's own cover image.
 */
function coverFor(collection: Collection) {
  const shotId = showcasePokemonBySlug[collection.slug]
  const shot = shotId ? getPokemonShot(shotId) : undefined
  return {
    src: shot?.src ?? collection.coverImage,
    alt: shot?.alt ?? collection.title,
    credit: shot ? `© ${shot.credit.author} · ${shot.credit.license}` : undefined,
  }
}

export default function CollectionGrid() {
  const collections = getAllCollections()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""
  const tagFilter = searchParams.get("tag") || ""
  const { playShutterSound } = useShutterSound()

  const [filteredCollections, setFilteredCollections] = useState(collections)
  const [lifted, setLifted] = useState<LiftCardData | null>(null)

  useEffect(() => {
    let filtered = collections

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (collection) =>
          collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply tag filter
    if (tagFilter) {
      filtered = filtered.filter((collection) =>
        collection.tags.some((tag) => tag.toLowerCase() === tagFilter.toLowerCase()),
      )
    }

    setFilteredCollections(filtered)
  }, [collections, searchQuery, tagFilter])

  if (filteredCollections.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No collections found</h3>
        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
      </div>
    )
  }

  // Group collections into sets of 7 (1 featured + 6 regular)
  const groupedCollections = []
  for (let i = 0; i < filteredCollections.length; i += 7) {
    const group = filteredCollections.slice(i, i + 7)
    if (group.length > 0) {
      groupedCollections.push(group)
    }
  }

  const openLift = (collection: Collection, index: number) => {
    const cover = coverFor(collection)
    playShutterSound()
    setLifted({
      src: cover.src,
      alt: cover.alt,
      title: collection.title,
      subtitle: cover.credit,
      meta: `${collection.photos.length} 张照片 · ${collection.tags[0] ?? "Collection"}`,
      badge: "Pokémon",
      href: `/collections/${collection.slug}`,
      hrefLabel: "进入合集",
      index: index + 1,
    })
  }

  return (
    <div className="space-y-16">
      {groupedCollections.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-8">
          {/* Featured Collection */}
          {group.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <div className="group relative">
                <div className="relative transition-transform duration-500 ease-out group-hover:scale-[1.015]">
                  {/* Pale white halo that blooms on hover */}
                  <div className="pointer-events-none absolute -inset-4 rounded-[46px] bg-white opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-70" />

                  {/* Outer glow: blurred rainbow halo */}
                  <div
                    className="pointer-events-none absolute -inset-3 rounded-[32px] opacity-55 blur-2xl saturate-150 transition-opacity duration-500 group-hover:opacity-80"
                    style={{ background: RAINBOW }}
                  />

                  {/* Rotating rainbow border */}
                  <div className="relative overflow-hidden rounded-[22px] p-[3px]">
                    <div
                      className="pk-rainbow absolute inset-[-60%]"
                      style={{ background: RAINBOW }}
                    />

                    <div className="relative overflow-hidden rounded-[19px] bg-black">
                      <div className="relative h-[400px] w-full overflow-hidden md:h-[520px]">
                        <Image
                          src={coverFor(group[0]).src}
                          alt={coverFor(group[0]).alt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
                          sizes="(max-width: 768px) 100vw, 1280px"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />
                        {/* Inner white bloom — reads as light wrapping the print */}
                        <div
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            boxShadow:
                              "inset 0 0 70px rgba(255,255,255,0.45), inset 0 0 12px rgba(255,255,255,0.35)",
                          }}
                        />
                      </div>

                      {/* Content positioned at the bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 rounded-full text-xs bg-white/30 text-white backdrop-blur-sm">
                            Featured Collection
                          </span>
                          {group[0].tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 rounded-full text-xs bg-white/20 text-white backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-3xl md:text-4xl text-white mb-3 group-hover:text-white/90 transition-colors">
                          {group[0].title}
                        </h3>
                        <p className="text-white/80 mb-6 max-w-2xl text-sm md:text-base group-hover:text-white/90 transition-colors">
                          {group[0].description}
                        </p>
                        <div className="inline-flex items-center gap-2 text-white border-b border-white/30 pb-1 group-hover:border-white transition-colors">
                          <span>Explore Collection</span>
                          <ArrowRight
                            size={16}
                            className="transform translate-x-0 transition-transform duration-300 group-hover:translate-x-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Whole-card link keeps the original navigation */}
                  <Link
                    href={`/collections/${group[0].slug}`}
                    aria-label={`进入 ${group[0].title}`}
                    onClick={playShutterSound}
                    className="absolute inset-0 z-10 rounded-[22px]"
                  />
                  <div className="pointer-events-none absolute inset-0 z-10 rounded-[22px] ring-1 ring-white/0 transition-all duration-500 group-hover:ring-white/50" />

                  {/* 3D preview trigger */}
                  <button
                    type="button"
                    onClick={() => openLift(group[0], 0)}
                    aria-label={`3D 预览 ${group[0].title}`}
                    className="absolute top-5 right-5 z-20 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[11px] text-white opacity-100 backdrop-blur-sm transition-all duration-300 hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Move3d size={13} /> 3D 预览
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Regular Collections Grid */}
          {group.length > 1 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.slice(1).map((collection, index) => (
                <motion.div
                  key={collection.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <div className="group relative h-full">
                    <div className="relative h-full transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                      {/* Pale white halo */}
                      <div className="pointer-events-none absolute -inset-4 rounded-[36px] bg-white opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70" />

                      {/* Rainbow glow */}
                      <div
                        className="pointer-events-none absolute -inset-2.5 rounded-[26px] opacity-55 blur-xl saturate-150 transition-opacity duration-500 group-hover:opacity-80"
                        style={{ background: RAINBOW }}
                      />

                      {/* Rotating rainbow border */}
                      <div className="relative h-full overflow-hidden rounded-[20px] p-[3px]">
                        <div
                          className="pk-rainbow absolute inset-[-60%]"
                          style={{ background: RAINBOW }}
                        />

                        <div className="relative h-full overflow-hidden rounded-[17px] bg-black">
                          <div className="relative h-80 w-full overflow-hidden">
                            <Image
                              src={coverFor(collection).src}
                              alt={coverFor(collection).alt}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-85"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
                            <div
                              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              style={{
                                boxShadow:
                                  "inset 0 0 48px rgba(255,255,255,0.5), inset 0 0 8px rgba(255,255,255,0.4)",
                              }}
                            />
                          </div>

                          {/* Content positioned at the bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-2xl text-white mb-2 group-hover:text-white/90 transition-colors">
                              {collection.title}
                            </h3>
                            <p className="text-white/80 mb-4 line-clamp-2 text-sm group-hover:text-white/90 transition-colors">
                              {collection.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <div className="flex flex-wrap gap-2">
                                {collection.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 rounded-full text-xs bg-white/20 text-white backdrop-blur-sm"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <ArrowRight
                                size={18}
                                className="text-white opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/collections/${collection.slug}`}
                        aria-label={`进入 ${collection.title}`}
                        onClick={playShutterSound}
                        className="absolute inset-0 z-10 rounded-[20px]"
                      />
                      <div className="pointer-events-none absolute inset-0 z-10 rounded-[20px] ring-1 ring-white/0 transition-all duration-500 group-hover:ring-white/50" />

                      <button
                        type="button"
                        onClick={() => openLift(collection, index + 1)}
                        aria-label={`3D 预览 ${collection.title}`}
                        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-2.5 py-1.5 text-[11px] text-white opacity-100 backdrop-blur-sm transition-all duration-300 hover:bg-black/80 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Move3d size={13} /> 3D
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ))}

      <LiftCard open={lifted !== null} data={lifted} onClose={() => setLifted(null)} />
    </div>
  )
}
