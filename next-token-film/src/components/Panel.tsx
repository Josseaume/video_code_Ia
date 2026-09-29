import React from 'react';
import {COLORS, COPY, FONT, T, sec} from '../config';
import {clamp, easeInExpo, progress, rgba} from '../lib/math';
import {useFilmFrame} from '../lib/scene';
import {charW, springAt} from '../lib/timeline';
import {GlowText, boxBloom} from './GlowText';

export const PANEL = {
  x: 176,
  y: -432,
  w: 612,
  pad: 30,
  rowsTop: 104,
  rowH: 56,
  labelW: 190,
  barW: 250,
};
const SIZE = FONT.panelSize;
const CW = charW(SIZE);

/** World position of the winning token's first glyph inside the panel. */
export const winnerSlot = () => ({
  x: PANEL.x + PANEL.pad + CW,
  y: PANEL.y + PANEL.rowsTop + COPY.winner * PANEL.rowH + PANEL.rowH / 2,
});

const panelHeight = PANEL.rowsTop + COPY.candidates.length * PANEL.rowH + PANEL.pad - 6;

/** Thin leader from the caret to the HUD. */
export const LeaderLine: React.FC = () => {
  const frame = useFilmFrame();
  const draw = springAt(frame, T.leaderLine, undefined, 0.9);
  const out = easeInExpo(progress(frame / 60, T.tokenLift, T.tokenLift + 0.35));
  const x1 = 196;
  const y1 = -34;
  const x2 = PANEL.x;
  const y2 = PANEL.y + panelHeight;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const head = draw;
  return (
    <svg
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
      width={1}
      height={1}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x1 + (x2 - x1) * head}
        y2={y1 + (y2 - y1) * head}
        stroke={COLORS.accent}
        strokeOpacity={0.7 * (1 - out)}
        strokeWidth={1.2}
        strokeDasharray={`${len * (1 - out)} ${len}`}
        strokeDashoffset={-len * out}
      />
      <circle cx={x1} cy={y1} r={3 * draw * (1 - out)} fill={COLORS.accent} />
      <circle cx={x2} cy={y2} r={2.5 * clamp(draw * 3 - 2) * (1 - out)} fill={COLORS.highlight} />
    </svg>
  );
};

export const Panel: React.FC = () => {
  const frame = useFilmFrame();
  const t = frame / 60;

  const inS = springAt(frame, T.panelIn, {damping: 200, stiffness: 120}, 1.1);
  const outS = easeInExpo(progress(t, T.panelOut, T.panelOut + 0.55));
  const headerIn = springAt(frame, T.panelHeader, undefined, 0.9);
  const ruleIn = springAt(frame, T.panelHeader + 0.15, undefined, 1.1);

  const pulseAge = t - T.winnerPulse;
  const pulse = pulseAge > 0 ? 0.5 - 0.5 * Math.cos((pulseAge / 0.85) * Math.PI * 2) : 0;
  const decide = springAt(frame, T.winnerPulse - 0.1, undefined, 0.8);
  const lifted = t >= T.tokenLift;

  const clipRight = (1 - inS) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL.x + (1 - inS) * 70 + outS * 120,
        top: PANEL.y,
        width: PANEL.w,
        height: panelHeight,
        opacity: clamp(inS * 1.5) * (1 - outS),
        clipPath: `inset(0 ${clipRight}% 0 0)`,
        background: `linear-gradient(180deg, ${rgba(COLORS.accent, 0.045)}, ${rgba(COLORS.accent, 0.012)})`,
        border: `1px solid ${rgba(COLORS.line, 0.13)}`,
        boxSizing: 'border-box',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* header */}
      <div style={{position: 'absolute', left: PANEL.pad, top: PANEL.pad - 2, opacity: headerIn, transform: `translateY(${(1 - headerIn) * 8}px)`}}>
        <GlowText size={22} color={COLORS.highlight} glow={0.45} weight={500}>
          {COPY.panelLabel}
        </GlowText>
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT.family,
            fontSize: 13,
            letterSpacing: '0.08em',
            color: rgba(COLORS.line, 0.38),
          }}
        >
          softmax · top-{COPY.candidates.length} of vocabulary
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: PANEL.pad,
          top: PANEL.rowsTop - 16,
          height: 1,
          width: (PANEL.w - PANEL.pad * 2) * ruleIn,
          background: rgba(COLORS.line, 0.16),
        }}
      />

      {/* rows */}
      {COPY.candidates.map((c, i) => {
        const start = T.rowsStart + i * T.rowStagger;
        const rowIn = springAt(frame, start, {damping: 200, stiffness: 140}, 0.7);
        const fill = springAt(frame, start + 0.12, {damping: 200, stiffness: 60}, T.barFill);
        const shownP = c.p * fill;
        const isWin = i === COPY.winner;
        const dim = isWin ? 1 : 1 - 0.55 * decide;
        const g = isWin ? pulse : 0;
        const y = PANEL.rowsTop + i * PANEL.rowH;
        return (
          <div
            key={c.token}
            style={{
              position: 'absolute',
              left: 0,
              top: y,
              width: PANEL.w,
              height: PANEL.rowH,
              opacity: rowIn * dim,
              transform: `translateX(${(1 - rowIn) * 24}px)`,
            }}
          >
            {isWin ? (
              <div
                style={{
                  position: 'absolute',
                  left: PANEL.pad - 12,
                  right: PANEL.pad - 12,
                  top: 6,
                  bottom: 6,
                  background: rgba(COLORS.accent, 0.05 + 0.07 * g * decide),
                  border: `1px solid ${rgba(COLORS.accent, 0.18 + 0.4 * g * decide)}`,
                  opacity: decide,
                }}
              />
            ) : null}
            <div style={{position: 'absolute', left: PANEL.pad, top: PANEL.rowH / 2 - SIZE / 2}}>
              <GlowText
                size={SIZE}
                color={isWin ? COLORS.highlight : COLORS.line}
                glow={isWin ? 0.35 + 1.3 * g * decide : 0}
                style={{opacity: isWin && lifted ? 0.18 : isWin ? 1 : 0.78}}
              >
                {`"${c.token}"`}
              </GlowText>
            </div>
            {/* bar track + fill */}
            <div
              style={{
                position: 'absolute',
                left: PANEL.pad + PANEL.labelW,
                top: PANEL.rowH / 2 - 2,
                width: PANEL.barW,
                height: 4,
                background: rgba(COLORS.line, 0.09),
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${shownP * 100}%`,
                  minWidth: fill > 0.02 ? 2 : 0,
                  background: isWin ? COLORS.highlight : COLORS.accent,
                  boxShadow: boxBloom(isWin ? 0.6 + 1.2 * g * decide : 0.35),
                }}
              />
              {/* tick marks on the scale */}
              {[0.25, 0.5, 0.75].map((k) => (
                <div
                  key={k}
                  style={{position: 'absolute', left: `${k * 100}%`, top: -3, width: 1, height: 10, background: rgba(COLORS.line, 0.14)}}
                />
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                right: PANEL.pad,
                top: PANEL.rowH / 2 - 11,
                fontFamily: FONT.family,
                fontSize: 22,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                color: isWin ? COLORS.highlight : rgba(COLORS.line, 0.75),
                textShadow: isWin ? `0 0 ${10 + 18 * g}px ${rgba(COLORS.accent, 0.6)}` : 'none',
              }}
            >
              {shownP.toFixed(3)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const PANEL_OUT_FRAME = sec(T.panelOut + 0.6);
