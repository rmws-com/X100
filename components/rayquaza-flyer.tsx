"use client"

import { useEffect, useRef } from "react"

/**
 * Rayquaza — a sky serpent that body-slides after the pointer.
 *
 * The head is the artwork the user supplied (`/dragon/rayquaza-head.png`,
 * cropped straight out of the official sprite). The body is drawn procedurally
 * as a ribbon that trails the head, so the creature is *uncoiled* and can weave
 * through the air the way a Chinese dragon does instead of being a frozen pose.
 *
 * How it flies:
 *  - the head damps toward the pointer, always a little behind it
 *  - every frame the head drops a point into a trail buffer; the spine is that
 *    trail resampled at even arc-length, so the body literally traces the path
 *    the head has flown — fast wiggles make tight coils, slow drifts a lazy S
 *  - two travelling sine waves ride on top of the spine, so the body keeps
 *    undulating even while the pointer is still
 *  - head turns with the heading; right-side travel mirrors the artwork so the
 *    face never ends up upside down
 *  - pointer rests → after IDLE_MS the head pitches up and shoots off the top
 *    of the screen, the body streaming behind it
 *
 * The layer is fixed at z-5 under the page content (z-10) and ignores pointer
 * events, so the serpent only ever shows in the gaps between cards.
 */

const HEAD_SRC = "/dragon/rayquaza-head.png"
const HEAD_ASPECT = 214 / 232 // source px
const ANCHOR_X = 0.62 // neck root inside the cut-out
const ANCHOR_Y = 0.8
const HEAD_FIX = 0.16 // the face is drawn looking slightly down
const SEGMENTS = 44
// the design sheet divides the body into armour segments — this many spine
// samples per segment, so bands and porthole rings land evenly
const SEG_LEN = 5
// spine indices that carry one of the flat flank plates
const PLATES = [13, 24, 34]
// the 3-clawed forelimb sits on this segment
const ARM_AT = 12
const IDLE_MS = 780
const TRAIL_MAX = 220
const MIN_STEP = 2.2

const TAU = Math.PI * 2

const lerpAngle = (a: number, b: number, t: number) => {
  let d = b - a
  while (d > Math.PI) d -= TAU
  while (d < -Math.PI) d += TAU
  return a + d * t
}

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v)

export default function RayquazaFlyer() {
  const layerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const layer = layerRef.current
    const canvas = canvasRef.current
    if (!layer || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const head = new Image()
    head.src = HEAD_SRC

    let headW = 192
    let bodyLen = 580
    let vw = 0
    let vh = 0

    const resize = () => {
      vw = layer.clientWidth
      vh = layer.clientHeight
      const small = vw < 640
      headW = small ? 122 : vw < 1024 ? 152 : 186
      bodyLen = small ? 460 : vw < 1024 ? 580 : 700
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      canvas.style.width = `${vw}px`
      canvas.style.height = `${vh}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // ---- flight state -----------------------------------------------------
    let phase: "hidden" | "follow" | "launch" = "hidden"
    let hx = 0 // head (neck root) position
    let hy = 0
    let tx = 0 // pointer target
    let ty = 0
    let vx = 0
    let vy = 0
    let dir = 0 // heading in radians
    let dirTarget = 0
    let pitch = 0 // head-only tilt, in addition to the heading
    let pitchTarget = 0
    let flip = 0 // 0 = artwork as-is (faces left), 1 = mirrored (faces right)
    let flipTarget = 0
    let opacity = 0
    let scale = 1
    let lastMove = 0
    let raf = 0
    let painted = false

    // ---- scratch buffers (avoid per-frame allocation) ---------------------
    const sx = new Float32Array(SEGMENTS)
    const sy = new Float32Array(SEGMENTS)
    const snx = new Float32Array(SEGMENTS)
    const sny = new Float32Array(SEGMENTS)
    const sw = new Float32Array(SEGMENTS)
    const trail: { x: number; y: number }[] = []

    const resetTrail = (x: number, y: number) => {
      trail.length = 0
      trail.push({ x, y })
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = layer.getBoundingClientRect()
      tx = event.clientX - rect.left
      ty = event.clientY - rect.top

      if (phase !== "follow") {
        // slip back in from the lower right, nose up, then climb to the cursor
        hx = tx + 150
        hy = ty + 250
        vx = 0
        vy = 0
        dir = dirTarget = Math.atan2(-250, -150)
        pitch = 0.2
        pitchTarget = 0
        flip = flipTarget = 0
        opacity = 0
        scale = 1.1
        resetTrail(hx, hy)
        phase = "follow"
      }

      lastMove = performance.now()
    }

    // ---- spine ------------------------------------------------------------
    // A chain of constant-length segments, each turned by a small angle. Because
    // every segment advances by exactly `step` in its current heading, the body
    // can undulate hard without ever folding back on itself — which is what the
    // old "offset a straight trail sideways" approach kept doing.
    const buildSpine = (now: number) => {
      const t = now * 0.001
      const wob = reduce ? 0.25 : 1
      const step = bodyLen / (SEGMENTS - 1)

      // start the neck slightly *inside* the head so its round end cap is
      // hidden by the skull instead of butting against the jaw
      const fwd = headW * 0.13
      sx[0] = hx + Math.cos(dir) * fwd
      sy[0] = hy + Math.sin(dir) * fwd
      // the body streams out behind the head
      let a = dir + Math.PI

      for (let i = 1; i < SEGMENTS; i++) {
        const u = i / (SEGMENTS - 1)
        // curvature grows toward the tail; the phase travels tailward, so the
        // wave rolls down the body like a swimming snake
        const neck = Math.min(1, Math.max(0, (u - 0.08) / 0.34))
        const k =
          (Math.sin(u * 8.4 - t * 3.0) + Math.sin(u * 13.6 - t * 4.6) * 0.36) *
          (0.05 + u * 0.21) *
          neck *
          wob
        a += k
        sx[i] = sx[i - 1] + Math.cos(a) * step
        sy[i] = sy[i - 1] + Math.sin(a) * step
      }
    }

    // ---- normals + width ---------------------------------------------------
    const shapeSpine = (now: number) => {
      const t = now * 0.001
      const ws = headW / 186

      for (let i = 0; i < SEGMENTS; i++) {
        const a = i > 0 ? i - 1 : 0
        const b = i < SEGMENTS - 1 ? i + 1 : SEGMENTS - 1
        let dx = sx[b] - sx[a]
        let dy = sy[b] - sy[a]
        const l = Math.hypot(dx, dy)
        if (l > 0.0001) {
          dx /= l
          dy /= l
        } else {
          dx = 1
          dy = 0
        }
        snx[i] = -dy
        sny[i] = dx

        const u = i / (SEGMENTS - 1)
        // muscle swell, so the tube reads as a body rather than a pipe
        const swell =
          (1 + Math.sin(i * 0.5 - t * 2.4) * 0.07 * Math.min(1, u * 5)) *
          (1 + Math.sin(u * 9.2 - 0.7) * 0.07)
        const w =
          u < 0.16
            ? 32 + (23.5 - 32) * Math.pow(u / 0.22, 0.55)
            : 23.5 * Math.pow(Math.max(0, 1 - (u - 0.22) / 0.78), 0.62) + 3.4
        // the silhouette pinches a little at every armour seam, which is what
        // gives the body its segmented look instead of reading as a hosepipe
        const seam = (i / SEG_LEN) % 1
        const bead = 1 - 0.075 * (0.5 + 0.5 * Math.cos(seam * TAU))
        sw[i] = w * ws * swell * bead
      }
    }

    // ---- painting helpers -------------------------------------------------
    const traceEdge = (side: number, reverse: boolean, fresh: boolean) => {
      const at = (n: number) => (reverse ? SEGMENTS - 1 - n : n)
      const X = (i: number) => sx[i] + snx[i] * sw[i] * side
      const Y = (i: number) => sy[i] + sny[i] * sw[i] * side

      const first = at(0)
      if (fresh) ctx.moveTo(X(first), Y(first))
      else ctx.lineTo(X(first), Y(first))

      for (let n = 1; n < SEGMENTS - 1; n++) {
        const i0 = at(n)
        const i1 = at(n + 1)
        const x0 = X(i0)
        const y0 = Y(i0)
        const x1 = X(i1)
        const y1 = Y(i1)
        ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      }

      const last = at(SEGMENTS - 1)
      ctx.lineTo(X(last), Y(last))
    }

    // a band of the tube between two normalised offsets (-1 … +1), used to fake
    // cylindrical shading with a handful of flat fills
    const traceBand = (a: number, b: number, fill: string) => {
      ctx.beginPath()
      traceEdge(a, false, true)
      traceEdge(b, true, false)
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()
    }

    // body outline including a round cap at the neck end, so the ribbon never
    // terminates on a straight cut where the head does not quite cover it
    const traceBody = () => {
      ctx.beginPath()
      traceEdge(1, false, true)
      traceEdge(-1, true, false)
      const a0 = Math.atan2(sny[0], snx[0])
      ctx.arc(sx[0], sy[0], Math.max(0.5, sw[0]), a0 + Math.PI, a0, true)
      ctx.closePath()
    }

    // ---- flat flank plates ------------------------------------------------
    // The design sheet puts a bevelled slab on each flank instead of a soft fin:
    // a short root chord, a slightly shorter outer chord, corners knocked off,
    // and an inset line that reads as the bevel. Painted before the tube, so
    // only the part that clears the silhouette is ever visible.
    const roundQuad = (pts: number[][], k: number) => {
      ctx.beginPath()
      for (let n = 0; n < pts.length; n++) {
        const a = pts[n]
        const b = pts[(n + 1) % pts.length]
        const c = pts[(n + 2) % pts.length]
        const d1x = b[0] - a[0]
        const d1y = b[1] - a[1]
        const l1 = Math.hypot(d1x, d1y) || 1
        const d2x = c[0] - b[0]
        const d2y = c[1] - b[1]
        const l2 = Math.hypot(d2x, d2y) || 1
        const k1 = Math.min(k, l1 * 0.42) / l1
        const k2 = Math.min(k, l2 * 0.42) / l2
        if (n === 0) ctx.moveTo(b[0] - d1x * k1, b[1] - d1y * k1)
        else ctx.lineTo(b[0] - d1x * k1, b[1] - d1y * k1)
        ctx.quadraticCurveTo(b[0], b[1], b[0] + d2x * k2, b[1] + d2y * k2)
      }
      ctx.closePath()
    }

    const drawPlates = (ws: number) => {
      for (let f = 0; f < PLATES.length; f++) {
        const i = PLATES[f]
        const w = sw[i]
        const tx = -sny[i]
        const ty = snx[i]
        const down = sny[i] >= 0 ? 1 : -1
        const sides: [number, string, string, number][] = [
          [-down, "#2c6644", "#143525", 0.84], // far flank, seen past the body
          [down, "#3b8360", "#173f2d", 1], // near flank
        ]

        for (const [sign, face, rim, size] of sides) {
          const nx = snx[i] * sign
          const ny = sny[i] * sign
          const len = w * (2.3 - f * 0.25) * size
          const bx = sx[i] + nx * w * 0.3
          const by = sy[i] + ny * w * 0.3
          const cA = w * 1.25 * size // half chord where it meets the body
          const back = len * 0.85 // how far the tip is raked toward the tail
          const tipC = w * 0.3 * size // half chord at the tip — the taper

          const pts = [
            [bx - tx * cA, by - ty * cA],
            [bx + nx * len - tx * (back + tipC), by + ny * len - ty * (back + tipC)],
            [bx + nx * len - tx * (back - tipC), by + ny * len - ty * (back - tipC)],
            [bx + tx * cA, by + ty * cA],
          ]
          roundQuad(pts, w * 0.36)
          ctx.fillStyle = face
          ctx.fill()
          ctx.lineWidth = Math.max(1.1, 1.6 * ws)
          ctx.strokeStyle = rim
          ctx.stroke()

          const cx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) / 4
          const cy = (pts[0][1] + pts[1][1] + pts[2][1] + pts[3][1]) / 4
          roundQuad(
            pts.map(([x, y]) => [cx + (x - cx) * 0.68, cy + (y - cy) * 0.68]),
            w * 0.26
          )
          ctx.lineWidth = Math.max(0.8, 1.05 * ws)
          ctx.strokeStyle = "rgba(146,206,168,0.26)"
          ctx.stroke()
        }
      }
    }

    // ---- forelimb ---------------------------------------------------------
    // A short three-clawed arm folded forward, the way the sheet draws it.
    const drawArm = (ws: number) => {
      const i = ARM_AT
      const w = sw[i]
      const tx = -sny[i]
      const ty = snx[i]
      const down = sny[i] >= 0 ? 1 : -1
      const nx = snx[i] * down
      const ny = sny[i] * down

      const shx = sx[i] + nx * w * 0.55
      const shy = sy[i] + ny * w * 0.55
      const elx = shx + nx * w * 0.95 - tx * w * 0.35
      const ely = shy + ny * w * 0.95 - ty * w * 0.35
      const wrx = elx + nx * w * 0.15 - tx * w * 0.95
      const wry = ely + ny * w * 0.15 - ty * w * 0.95

      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      const limb = () => {
        ctx.beginPath()
        ctx.moveTo(shx, shy)
        ctx.quadraticCurveTo(elx, ely, wrx, wry)
      }
      limb()
      ctx.lineWidth = Math.max(3.6, w * 0.9)
      ctx.strokeStyle = "rgba(18,50,36,0.92)"
      ctx.stroke()
      limb()
      ctx.lineWidth = Math.max(2.6, w * 0.66)
      ctx.strokeStyle = "#3d8562"
      ctx.stroke()

      // joints, so the limb reads as articulated rather than as a bent wire
      for (const [jx, jy, jr] of [
        [elx, ely, w * 0.4],
        [wrx, wry, w * 0.3],
      ]) {
        ctx.beginPath()
        ctx.arc(jx, jy, Math.max(1.6, jr), 0, TAU)
        ctx.fillStyle = "#3d8562"
        ctx.fill()
        ctx.lineWidth = Math.max(0.9, 0.9 * ws)
        ctx.strokeStyle = "rgba(18,50,36,0.9)"
        ctx.stroke()
      }

      const fwd = Math.atan2(-ty, -tx)
      const cl = w * 0.55
      for (const spread of [-0.32, 0, 0.32]) {
        const ang = fwd + spread
        const perp = ang + Math.PI / 2
        const hw = w * 0.19
        const tipx = wrx + Math.cos(ang) * cl
        const tipy = wry + Math.sin(ang) * cl
        ctx.beginPath()
        ctx.moveTo(wrx + Math.cos(perp) * hw, wry + Math.sin(perp) * hw)
        ctx.quadraticCurveTo(
          wrx + Math.cos(ang) * cl * 0.62 + Math.cos(perp) * hw * 0.75,
          wry + Math.sin(ang) * cl * 0.62 + Math.sin(perp) * hw * 0.75,
          tipx,
          tipy
        )
        ctx.quadraticCurveTo(
          wrx + Math.cos(ang) * cl * 0.58 - Math.cos(perp) * hw * 0.7,
          wry + Math.sin(ang) * cl * 0.58 - Math.sin(perp) * hw * 0.7,
          wrx - Math.cos(perp) * hw,
          wry - Math.sin(perp) * hw
        )
        ctx.closePath()
        ctx.fillStyle = "rgba(232,236,206,0.96)"
        ctx.fill()
        ctx.lineWidth = Math.max(0.8, 0.9 * ws)
        ctx.strokeStyle = "rgba(22,58,42,0.82)"
        ctx.stroke()
      }
    }

    const drawBody = () => {
      const ws = headW / 186

      drawPlates(ws)

      // silhouette
      traceBody()
      ctx.fillStyle = "#3d8a5f"
      ctx.fill()

      // cylindrical shading: stacked bands from the lit ridge down to the shaded
      // belly, so the tube reads as round instead of flat
      traceBand(1, 0.52, "rgba(170,228,188,0.32)")
      traceBand(0.52, 0.06, "rgba(124,198,152,0.17)")
      traceBand(-0.06, -0.56, "rgba(14,48,36,0.17)")
      traceBand(-0.56, -1, "rgba(9,38,28,0.34)")
      traceBand(-0.94, -1, "rgba(6,30,22,0.30)")

      // ---- porthole ring on every armour segment
      for (let i = Math.floor(SEG_LEN * 0.5); i < SEGMENTS - 2; i += SEG_LEN) {
        const ang = Math.atan2(snx[i], sny[i])
        ctx.beginPath()
        ctx.ellipse(
          sx[i],
          sy[i],
          Math.max(1, sw[i] * 0.95),
          Math.max(1, sw[i] * 0.5),
          ang + Math.PI / 2,
          0,
          TAU
        )
        ctx.fillStyle = "rgba(168,224,190,0.07)"
        ctx.fill()
        ctx.lineWidth = Math.max(0.9, 1.2 * ws)
        ctx.strokeStyle = "rgba(18,54,38,0.45)"
        ctx.stroke()
      }

      // ---- armour seams: a dark band wraps the tube at every segment joint,
      // with a thin gold edge on its head side
      for (let i = SEG_LEN; i < SEGMENTS - 2; i += SEG_LEN) {
        const tx = -sny[i]
        const ty = snx[i]
        const r = sw[i] * 1.04
        const bow = sw[i] * 0.26

        ctx.beginPath()
        ctx.moveTo(sx[i] + snx[i] * r, sy[i] + sny[i] * r)
        ctx.quadraticCurveTo(sx[i] + tx * bow, sy[i] + ty * bow, sx[i] - snx[i] * r, sy[i] - sny[i] * r)
        ctx.lineCap = "butt"
        ctx.lineWidth = Math.max(2.2, 3.3 * ws)
        ctx.strokeStyle = "rgba(14,44,31,0.80)"
        ctx.stroke()

        const off = Math.max(2.2, 3.3 * ws) * 0.62
        ctx.beginPath()
        ctx.moveTo(sx[i] + snx[i] * r - tx * off, sy[i] + sny[i] * r - ty * off)
        ctx.quadraticCurveTo(
          sx[i] + tx * bow - tx * off,
          sy[i] + ty * bow - ty * off,
          sx[i] - snx[i] * r - tx * off,
          sy[i] - sny[i] * r - ty * off
        )
        ctx.lineWidth = Math.max(1, 1.25 * ws)
        ctx.strokeStyle = "rgba(238,210,110,0.66)"
        ctx.stroke()
      }

      // dorsal ridge highlight — gives the tube a readable top side
      ctx.beginPath()
      for (let i = 0; i < SEGMENTS - 1; i++) {
        const s = sw[i] * 0.5
        const x0 = sx[i] + snx[i] * s
        const y0 = sy[i] + sny[i] * s
        const x1 = sx[i + 1] + snx[i + 1] * sw[i + 1] * 0.5
        const y1 = sy[i + 1] + sny[i + 1] * sw[i + 1] * 0.5
        if (i === 0) ctx.moveTo(x0, y0)
        ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      }
      ctx.lineWidth = Math.max(1, 3.4 * ws)
      ctx.strokeStyle = "rgba(198,242,206,0.28)"
      ctx.stroke()

      // outline last so the shading bands can't eat it
      traceBody()
      ctx.lineWidth = Math.max(1, 1.5 * ws)
      ctx.strokeStyle = "rgba(23,62,44,0.8)"
      ctx.stroke()

      drawArm(ws)

      // ---- tail: the three-pronged fan from the sheet
      const li = SEGMENTS - 1
      const px = sx[li]
      const py = sy[li]
      let dx = px - sx[li - 1]
      let dy = py - sy[li - 1]
      const l = Math.hypot(dx, dy) || 1
      dx /= l
      dy /= l
      const nx = -dy
      const ny = dx
      const fin = 17 * ws

      ctx.beginPath()
      ctx.moveTo(px - nx * fin * 0.75, py - ny * fin * 0.75)
      ctx.quadraticCurveTo(
        px + dx * fin * 0.9 - nx * fin * 1.5,
        py + dy * fin * 0.9 - ny * fin * 1.5,
        px + dx * fin * 2.1 - nx * fin * 0.6,
        py + dy * fin * 2.1 - ny * fin * 0.6
      )
      ctx.quadraticCurveTo(px + dx * fin * 1.1, py + dy * fin * 1.1, px + dx * fin * 2.3, py + dy * fin * 2.3)
      ctx.quadraticCurveTo(px + dx * fin * 1.1, py + dy * fin * 1.1, px + dx * fin * 2.1 + nx * fin * 0.6, py + dy * fin * 2.1 + ny * fin * 0.6)
      ctx.quadraticCurveTo(
        px + dx * fin * 0.9 + nx * fin * 1.5,
        py + dy * fin * 0.9 + ny * fin * 1.5,
        px + nx * fin * 0.75,
        py + ny * fin * 0.75
      )
      ctx.closePath()
      ctx.fillStyle = "rgba(84,160,120,0.98)"
      ctx.fill()
      ctx.lineWidth = Math.max(1.1, 1.8 * ws)
      ctx.strokeStyle = "rgba(190,92,106,0.85)"
      ctx.stroke()
    }

    const drawHead = () => {
      if (!head.complete || !head.naturalWidth) return
      const w = headW * scale
      const h = headW * HEAD_ASPECT * scale
      // artwork looks left-and-down, so a heading of 0 needs a half turn plus
      // the face offset — and the offset flips sign once the sprite is mirrored
      const theta = dir - Math.PI + flip * Math.PI + HEAD_FIX * (1 - 2 * flip) + pitch

      ctx.save()
      ctx.translate(hx, hy)
      ctx.rotate(theta)
      ctx.scale(1 - 2 * flip, 1) // +1 → artwork, -1 → mirrored
      ctx.drawImage(head, -ANCHOR_X * w, -ANCHOR_Y * h, w, h)
      ctx.restore()
    }

    // ---- loop -------------------------------------------------------------
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) return

      const now = performance.now()

      if (phase === "hidden") {
        if (painted) {
          ctx.clearRect(0, 0, vw, vh)
          painted = false
        }
        return
      }

      if (phase === "follow") {
        if (now - lastMove > IDLE_MS) {
          phase = "launch"
          vx = 0
          vy = reduce ? -10 : -2.6
          pitchTarget = -0.62
        } else {
          const prevX = hx
          const prevY = hy
          hx += (tx - hx) * 0.16
          hy += (ty - hy) * 0.16

          const dx = hx - prevX
          const dy = hy - prevY
          const dist = Math.hypot(dx, dy)

          if (dist > 0.6) dirTarget = Math.atan2(dy, dx)
          dir = lerpAngle(dir, dirTarget, 0.2)

          // nose follows the vertical part of the motion (dive → nose down)
          pitchTarget = clamp(dy * 0.018, -0.15, 0.15)

          flipTarget = Math.cos(dir) > 0 ? 1 : 0
          opacity = Math.min(1, opacity + 0.06)
          scale += (1 - scale) * 0.15

          const anchor = trail[0]
          if (!anchor || Math.hypot(hx - anchor.x, hy - anchor.y) > MIN_STEP) {
            trail.unshift({ x: hx, y: hy })
            if (trail.length > TRAIL_MAX) trail.pop()
          }
        }
      } else {
        // launch — pitch up and climb out of the frame
        vy -= reduce ? 2.4 : 1.15
        hx += vx
        hy += vy
        scale += 0.004
        opacity -= 0.02
        pitchTarget = -0.9

        trail.unshift({ x: hx, y: hy })
        if (trail.length > TRAIL_MAX) trail.pop()

        if (opacity <= 0 || hy < -vh * 0.6) {
          opacity = 0
          phase = "hidden"
          ctx.clearRect(0, 0, vw, vh)
          painted = false
          return
        }
      }

      pitch += (pitchTarget - pitch) * 0.1
      flip += (flipTarget - flip) * 0.2

      buildSpine(now)
      shapeSpine(now)

      ctx.clearRect(0, 0, vw, vh)
      if (opacity > 0.002) {
        ctx.globalAlpha = Math.min(1, opacity)
        drawBody()
        drawHead()
        ctx.globalAlpha = 1
        painted = true
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("resize", resize)
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="sx-flyer-layer pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      <canvas ref={canvasRef} className="sx-dragon-canvas" />
    </div>
  )
}
