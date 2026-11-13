"use client"

import Image from "next/image"
import { useState } from "react"
import { Move3d, Sparkles } from "lucide-react"
import { flipShots } from "@/lib/pokemon"
import { useShutterSound } from "./sound-effects"

const RAINBOW =
  "conic-gradient(from 0deg, #ff4d6d, #ffb703, #52e5a3, #38bdf8, #a855f7, #ff4d6d)"

/**
 * Five photos that flip over on click. The card is a real button, so the flip
 * also works with Enter/Space and is announced through `aria-pressed`.
 */
export default function PokemonFlipCards() {
  const { playShutterSound } = useShutterSound()
  const [flipped, setFlipped] = useState<Set<string>>(new Set())

  if (flipShots.length === 0) return null

  const toggle = (id: string) => {
    playShutterSound()
    setFlipped((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl text-primary">Pokémon Frames</h2>
          <p className="mt-1 text-sm text-primary-secondary">
            点击任意一张图片即可翻转，查看拍摄者与授权信息
          </p>
        </div>
        <span className="text-xs text-primary-secondary/70">
          共 {flipShots.length} 张 · 均来自 Wikimedia Commons 自由许可
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {flipShots.map((shot, index) => {
          const isFlipped = flipped.has(shot.id)
          return (
            <button
              key={shot.id}
              type="button"
              onClick={() => toggle(shot.id)}
              aria-pressed={isFlipped}
              aria-label={`${shot.title} —— 点击${isFlipped ? "翻回正面" : "翻转查看背面"}`}
              className="group relative block w-full text-left [perspective:1200px]"
            >
              {/* Pale white halo on hover */}
              <div className="pointer-events-none absolute -inset-3 rounded-[30px] bg-white opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70" />

              {/* Rainbow ring behind the card */}
              <div
                className="pointer-events-none absolute -inset-[3px] rounded-[22px] opacity-60 blur-[6px] transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: RAINBOW }}
              />

              <div
                className={`relative aspect-[3/4] w-full transition-transform duration-700 ease-out [transform-style:preserve-3d] motion-reduce:transition-none ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* ---------- Front: the photo ---------- */}
                <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-black/10 bg-black [backface-visibility:hidden]">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  {/* Number badge */}
                  <span className="absolute top-3 left-3 rounded-full border border-white/25 bg-black/50 px-2 py-0.5 text-[10px] tabular-nums text-white/85 backdrop-blur-sm">
                    {`No.${String(index + 1).padStart(2, "0")}`}
                  </span>

                  {/* Hint */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-white">{shot.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/60">
                        <Move3d size={10} /> 点击翻转
                      </p>
                    </div>
                  </div>

                  {/* Light sweep on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                  </div>
                </div>

                {/* ---------- Back: the credit ---------- */}
                <div
                  className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[20px] border border-white/15 bg-[radial-gradient(120%_120%_at_20%_0%,#2a2a33_0%,#0b0b0e_60%,#000_100%)] p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-white/45">
                      <Sparkles size={11} className="text-amber-300/80" />
                      <span className="text-[9px] uppercase tracking-[0.28em]">Pokémon</span>
                    </div>
                    <p className="mt-2 text-sm leading-snug text-white/95">{shot.title}</p>
                    <p className="mt-3 text-[10px] leading-relaxed text-white/50">
                      摄影
                      <br />
                      <span className="text-white/75">{shot.credit.author}</span>
                    </p>
                    <p className="mt-2 text-[10px] text-white/45">
                      授权
                      <br />
                      <span className="text-white/75">{shot.credit.license}</span>
                    </p>
                  </div>

                  <p className="text-[10px] text-white/35">再次点击翻回正面</p>

                  {/* Faint corner light so the back does not look flat */}
                  <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-primary-secondary/70">
        图片均来自 Wikimedia Commons（CC0 / CC BY 2.0 / CC BY 4.0），仅等比缩放至 1920px 供展示。
        宝可梦角色及相关形象版权归 Nintendo / Creatures / GAME FREAK 所有，此处仅作纪实摄影展示。
      </p>
    </div>
  )
}
