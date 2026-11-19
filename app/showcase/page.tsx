"use client"

import { Suspense } from "react"
import CollectionGrid from "@/components/collection-grid"
import PokemonFlipCards from "@/components/pokemon-flip-cards"
import ShowcaseVideo from "@/components/showcase-video"
import TagFilters from "@/components/tag-filters"
import Loading from "@/components/loading"
import SkyBackdrop from "@/components/sky-backdrop"
import RayquazaFlyer from "@/components/rayquaza-flyer"
import { motion } from "framer-motion"

export default function ShowcasePage() {
  return (
    <div className="dark relative min-h-screen">
      {/* Sky stage (z-0) */}
      <SkyBackdrop />

      {/* The sky serpent lives between the backdrop and the content (z-5) */}
      <RayquazaFlyer />

      {/* Everything readable sits above the sky and the serpent (z-10) */}
      <div className="relative z-10">
        {/* Hero — open sky */}
        <section className="relative flex h-[56vh] min-h-[430px] w-full flex-col items-center justify-center px-4 text-center">
          <motion.h1
            className="text-4xl md:text-5xl text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Photography Collections
          </motion.h1>
          <motion.p
            className="text-white/85 text-lg max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            Explore my diverse portfolio of photography from around the world
          </motion.p>
          <motion.p
            className="mt-10 text-[11px] uppercase tracking-[0.3em] text-white/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Move your cursor — something is circling above
          </motion.p>
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
    </div>
  )
}
