import {noise3D} from '@remotion/noise';
import React, {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, CONTOURS, COPY, FONT, T, VIDEO, sec} from '../config';
import {clamp, easeOutExpo, hash2, progress, rgba, smoothstep} from '../lib/math';
import {camera, charW, collapseAt, morphAt, rippleAt, rowY} from '../lib/timeline';

const {width: W, height: H, fps} = VIDEO;
const TAU = Math.PI * 2;
const LINE_SPAN = 2600;

/**
 * Procedural topographic field: concentric rings displaced by simplex noise,
 * keystroke ripples and the impact shockwave. After the shockwave each ring
 * unrolls into a straight row and becomes a lane of streaming tokens.
 */
export const Contours: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const t = frame / fps;
    const cam = camera(frame);
    const collapse = collapseAt(frame);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (cam.s < 0.002) return;
    ctx.setTransform(cam.s, 0, 0, cam.s, W / 2 + cam.tx, H / 2 + cam.ty);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const K = CONTOURS.points;
    const breathe = Math.sin((TAU * t) / CONTOURS.breathePeriodSec);
    const pxW = CONTOURS.lineWidth / Math.max(cam.s, 1);
    // lines brighten as they converge into the point
    const collapseGain = 1 + collapse * 2.2;

    for (let i = 0; i < CONTOURS.rings; i++) {
      const r0 = CONTOURS.innerRadius + i * CONTOURS.spacing;

      // draw-on from the center outward
      const drawStart = T.contourDrawStart + i * T.contourRingStagger;
      const dp = easeOutExpo(progress(t, drawStart, drawStart + T.contourRingDraw));
      if (dp <= 0.001) continue;

      const m = morphAt(frame, r0);
      const ringBreathe = 1 + CONTOURS.breatheAmp * Math.sin((TAU * t) / CONTOURS.breathePeriodSec + i * 0.18);
      const amp = CONTOURS.noiseAmp + r0 * CONTOURS.noiseAmpGrowth;
      const {d: ripple, heat, glint} = rippleAt(frame, r0);
      const theta0 = m > 0 ? Math.PI : -Math.PI / 2 + i * 0.37;
      const rowYi = rowY(i);
      const zt = t * CONTOURS.noiseSpeed + breathe * 0.04;

      ctx.beginPath();
      const steps = Math.max(2, Math.ceil(K * dp));
      for (let j = 0; j <= steps; j++) {
        const u = Math.min(j / K, dp);
        const th = theta0 + TAU * u;
        const c = Math.cos(th);
        const s = Math.sin(th);
        const nx = c * r0 * CONTOURS.noiseScale;
        const ny = s * r0 * CONTOURS.noiseScale;
        const n =
          noise3D('contour', nx, ny, zt) * amp +
          noise3D('detail', nx * 3.1, ny * 3.1, zt * 1.7) * amp * 0.22;
        const rr = r0 * ringBreathe + n + ripple;
        let x = c * rr;
        let y = s * rr;
        if (m > 0) {
          const lx = (u - 0.5) * LINE_SPAN;
          x += (lx - x) * m;
          y += (rowYi - y) * m;
        }
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // opacity: fade in with the draw, fade towards the frame edge
      const edge = 1 - smoothstep(760, 1180, r0) * (1 - m);
      const a = CONTOURS.opacity * clamp(dp * 1.6) * edge * collapseGain;

      if (heat > 0.03) {
        ctx.strokeStyle = rgba(COLORS.accent, clamp(a + heat * 0.9));
        ctx.lineWidth = pxW + heat * 2.2;
        ctx.shadowColor = rgba(COLORS.accent, 0.9 * heat);
        ctx.shadowBlur = 22 * heat;
      } else {
        ctx.strokeStyle = rgba(COLORS.line, Math.min(1, a * (1 - 0.35 * m) + glint * 0.35 * dp));
        ctx.lineWidth = pxW;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // ------------------------------------------------ token grid lanes ----
    const fontPx = FONT.gridSize;
    const cw = charW(fontPx);
    ctx.font = `400 ${fontPx}px "${FONT.family}"`;
    ctx.textBaseline = 'middle';
    const sinceImpact = t - T.impact;
    if (sinceImpact > 0) {
      for (let i = 0; i < CONTOURS.rings; i++) {
        const r0 = CONTOURS.innerRadius + i * CONTOURS.spacing;
        const m = morphAt(frame, r0);
        if (m < 0.6) continue;
        const laneA = smoothstep(0.6, 1, m);
        const y0 = rowY(i);
        const sign = i % 2 === 0 ? 1 : -1;
        const yText = y0 + sign * (CONTOURS.rowSpacing / 2);
        const speed = 55 + hash2(i, 7) * 150;
        const scroll = sinceImpact * speed + hash2(i, 3) * 400;
        // the moment this lane finished unrolling
        const settled = T.impact + r0 / 1450 + 0.05 + 0.95 * 0.75;
        const laneAge = t - settled;
        const depth = 1 - smoothstep(90, 560, Math.abs(y0)) * 0.8;

        let x = -3000 + scroll;
        let n = Math.floor(hash2(i, 11) * 997);
        while (x < 1500) {
          const tok = COPY.vocab[Math.floor(hash2(i, n) * COPY.vocab.length)];
          const w = tok.length * cw + 18;
          if (x + w > -1500) {
            // left→right reveal wave through the lane
            const reveal = smoothstep(0, 0.35, laneAge * 1.6 - (x + 1300) / 2600);
            const h = hash2(n, i * 13 + 5);
            const empty = hash2(n + 3, i * 7 + 1) < 0.38;
            const hot = !empty && h < 0.045;
            // occasional "sampled" flash travelling with the stream
            const flash = hot ? 0.5 + 0.5 * Math.sin(t * 5 + n) : 0;
            const alpha = laneA * reveal * depth * (1 + collapse);
            if (alpha > 0.01 && !empty) {
              ctx.fillStyle = hot
                ? rgba(flash > 0.8 ? COLORS.highlight : COLORS.accent, alpha * (0.55 + 0.4 * flash))
                : rgba(COLORS.line, alpha * (0.1 + h * 0.16));
              ctx.fillText(tok.replace(/ /g, '·'), x + 9, yText);
              ctx.fillStyle = rgba(COLORS.line, alpha * 0.1);
              ctx.fillRect(x, yText - 6, 1, 12);
            }
          }
          x += w;
          n++;
        }
      }
    }
  }, [frame]);

  // the collapse pass also dims the field just before the point appears
  const fade = 1 - smoothstep(sec(T.collapse + T.collapseDur) - 6, sec(T.collapse + T.collapseDur) + 4, frame);
  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      style={{position: 'absolute', inset: 0, width: W, height: H, opacity: fade}}
    />
  );
};
