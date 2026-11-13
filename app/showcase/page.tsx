"use client"

import { Suspense } from "react"
import Image from "next/image"
import CollectionGrid from "@/components/collection-grid"
import PokemonFlipCards from "@/components/pokemon-flip-cards"
import ShowcaseVideo from "@/components/showcase-video"
import TagFilters from "@/components/tag-filters"
import Loading from "@/components/loading"
import { getPokemonShot, showcaseHeroShotId } from "@/lib/pokemon"
import { motion } from "framer-motion"

export default function ShowcasePage() {
  const hero = getPokemonShot(showcaseHeroShotId)

  return (
    <div className="min-h-screen">
      {/* Spacer for header
      <div className="header-height"></div> */}

      {/* Hero Section */}
      <section className="relative h-[50vh] w-full">
        <Image
          src={hero?.src ?? "/Morocco/morocco-11.webp?height=800&width=1920"}
          alt={hero?.alt ?? "Photography collections showcase"}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
        <motion.div
          className="absolute inset-0 flex flex-col justify-center items-center text-center p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl text-white mb-4">Photography Collections</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            Explore my diverse portfolio of photography from around the world
          </p>
        </motion.div>

        {/* Attribution required by the CC licence of the hero photo */}
        {hero && (
          <p className="absolute bottom-3 right-4 text-[10px] text-white/45">
            {`© ${hero.credit.author} · ${hero.credit.license}`}
          </p>
        )}
      </section>

      {/* Five flip cards — click any photo to flip it over */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pt-14">
        <PokemonFlipCards />
      </section>

      {/* Tags - Centered */}
      <motion.section
        className="py-8 px-4 md:px-8 max-w-7xl mx-auto mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex justify-center mb-8">
          <TagFilters />
        </div>
      </motion.section>

      {/* Collections Grid */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto pb-20">
        <Suspense fallback={<Loading />}>
          <CollectionGrid />
        </Suspense>
      </section>

      {/* Showreel — always-on preview, click for a full-width stage */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pb-24">
        <ShowcaseVideo />
      </section>
    </div>
  )
}
