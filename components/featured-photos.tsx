"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, ArrowRight } from "lucide-react"
import { getFeaturedPhotos } from "@/lib/collections"
import { useShutterSound } from "./sound-effects"

// Rainbow palette used for both the rotating border and the outer glow
const RAINBOW =
  "conic-gradient(from 0deg, #ff4d6d, #ffb703, #52e5a3, #38bdf8, #a855f7, #ff4d6d)"

export default function FeaturedPhotos() {
  const featured = getFeaturedPhotos()
  const { playShutterSound } = useShutterSound()

  if (featured.length === 0) return null

  // Two identical groups make the loop seamless: the track slides by exactly
  // one group width, then restarts. Each group carries its own trailing pad so
  // the gap across the seam matches the gap between cards.
  const groups = [0, 1]

  return (
    <div className="fp-viewport relative -mx-4 overflow-hidden px-4 py-6">
      {/* soft fade at both edges so cards dissolve instead of cutting off */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-20 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-20 bg-gradient-to-l from-background to-transparent" />

      <div className="fp-track flex w-max">
        {groups.map((group) => (
          <div
            key={group}
            className="flex shrink-0 gap-6 pr-6"
            aria-hidden={group === 1}
          >
            {featured.map(({ photo, collection }) => (
              <Link
                key={`${group}-${photo.id}`}
                href={`/collections/${collection.slug}`}
                onClick={playShutterSound}
                className="group relative block w-[240px] shrink-0 sm:w-[280px] lg:w-[300px]"
                tabIndex={group === 1 ? -1 : 0}
              >
                {/* Outer glow: blurred rainbow halo */}
                <div
                  className="pointer-events-none absolute -inset-3 rounded-[30px] opacity-70 blur-2xl saturate-150 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: RAINBOW }}
                />

                {/* Rotating rainbow border */}
                <div className="relative overflow-hidden rounded-2xl p-[3px]">
                  <div
                    className="fp-rainbow absolute inset-[-60%]"
                    style={{ background: RAINBOW }}
                  />
                  <div className="relative overflow-hidden rounded-[13px] bg-black">
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Image
                        src={photo.src}
                        alt={photo.alt || collection.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-85"
                        sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 300px"
                        quality={85}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                    </div>

                    {/* Featured badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2 py-1 backdrop-blur-sm">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-white">精选</span>
                    </div>

                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{collection.title}</p>
                        <p className="truncate text-xs text-white/70">
                          {`No.${String(photo.id.split("-").pop()).padStart(2, "0")}`}
                        </p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="shrink-0 -translate-x-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
