import {Circle, Line, makeScene2D, Node, Rect, Txt} from '@revideo/2d';
import {createSignal} from '@revideo/core';
import fontUrl from '../../../shared/JetBrainsMono-latin.woff2?url';
import {
  C, EDGE, FIBER_START, FONT, LEAF, LEAF_Y, RACK, RACK_IN, SPINE, SPINE_Y, T,
  camera, clamp, fmt, frac, hash, inOutExpo, leafX, outExpo, packet, prog, rackX,
  rgba, slotActivation, slotY, smooth, spec, spineX,
} from '../lib';

const {width: W, height: H, duration} = spec.video;
const L = spec.layout;
const range = (n: number) => Array.from({length: n}, (_, i) => i);

export default makeScene2D('datacenter', function* (view) {
  // font: the same Google Fonts file, vendored in shared/
  const face = new FontFace(FONT, `url(${fontUrl})`, {weight: '100 800'});
  document.fonts.add(face);
  yield face.load();

  // Master clock. Every property below is a pure function of t, so the render is deterministic.
  const time = createSignal(0);
  const t = () => time();
  const cam = () => camera(t());

  const txt = {fontFamily: FONT, fontWeight: 400};
  // Txt content can't be a computed signal in Revideo 0.11 (leaves spawn outside the
  // scene context), so dynamic strings are pushed once per frame from the main loop.
  const updaters: (() => void)[] = [];
  const liveText = (node: Txt, value: () => string) => {
    updaters.push(() => {
      const v = value();
      if (node.text() !== v) node.text(v);
    });
    return node;
  };

  // ---------------------------------------------------------- backdrop ----
  // faint blueprint grid with slight parallax
  const G = 60;
  view.add(
    <Node>
      {range(Math.ceil(W / G) + 2).map((i) => (
        <Line
          points={() => {
            const off = -frac((cam().x * 0.25) / G) * G;
            const x = -W / 2 + i * G + off;
            return [[x, -H / 2], [x, H / 2]];
          }}
          stroke={rgba(C.line, 0.035)}
          lineWidth={1}
        />
      ))}
      {range(Math.ceil(H / G) + 2).map((j) => (
        <Line
          points={() => {
            const off = -frac((cam().y * 0.25) / G) * G;
            const y = -H / 2 + j * G + off;
            return [[-W / 2, y], [W / 2, y]];
          }}
          stroke={rgba(C.line, 0.035)}
          lineWidth={1}
        />
      ))}
    </Node>,
  );

  // ------------------------------------------------------------- world ----
  const world = (
    <Node scale={() => Math.max(cam().s, 0.0001)} position={() => [-cam().x * cam().s, -cam().y * cam().s]} opacity={() => (cam().s < 0.003 ? 0 : 1)} />
  ) as Node;
  view.add(world);

  // fiber into the edge router
  world.add(
    <Line
      points={[[FIBER_START.x, FIBER_START.y], [EDGE.x - 32, EDGE.y]]}
      stroke={rgba(C.line, 0.28)}
      lineWidth={1.4}
      end={() => outExpo(prog(t(), T.fiberDraw, T.fiberDraw + 1.4))}
    />,
  );
  // lit fiber segment behind the packet
  world.add(
    <Line
      points={() => [[FIBER_START.x, EDGE.y], [Math.min(packet(t()).x, EDGE.x - 32), EDGE.y]]}
      stroke={C.accent}
      lineWidth={2}
      shadowBlur={14}
      shadowColor={C.accent}
      opacity={() => (t() < T.hopSpine ? 0.85 * (1 - prog(t(), T.packetArrive + 0.4, T.hopSpine)) : 0)}
    />,
  );

  // links edge → spines, spines → leaves
  range(L.spines).forEach((i) => {
    const s0 = T.linksDraw + i * 0.07;
    world.add(
      <Line
        points={[[EDGE.x, EDGE.y + 32], [spineX(i), SPINE_Y - 28]]}
        stroke={rgba(C.line, 0.16)}
        lineWidth={1.2}
        end={() => outExpo(prog(t(), s0, s0 + 0.9))}
      />,
    );
    range(L.leaves).forEach((j) => {
      const s1 = T.linksDraw + 0.3 + (i * L.leaves + j) * 0.014;
      world.add(
        <Line
          points={[[spineX(i), SPINE_Y + 28], [leafX(j), LEAF_Y - 24]]}
          stroke={rgba(C.line, 0.1)}
          lineWidth={1}
          end={() => outExpo(prog(t(), s1, s1 + 0.9))}
        />,
      );
    });
  });

  // active route, lit as the packet travels it
  const route: [typeof EDGE, typeof EDGE, number, number][] = [
    [{x: EDGE.x, y: EDGE.y + 32}, {x: SPINE.x, y: SPINE.y - 28}, T.hopSpine, 0.6],
    [{x: SPINE.x, y: SPINE.y + 28}, {x: LEAF.x, y: LEAF.y - 24}, T.hopLeaf, 0.7],
    [{x: LEAF.x, y: LEAF.y + 24}, {x: RACK_IN.x, y: RACK_IN.y}, T.packetToRack, 0.4],
  ];
  route.forEach(([a, b, s, d]) =>
    world.add(
      <Line
        points={[[a.x, a.y], [b.x, b.y]]}
        stroke={C.accent}
        lineWidth={2}
        shadowBlur={16}
        shadowColor={C.accent}
        end={() => inOutExpo(prog(t(), s, s + d))}
        opacity={() => 0.9 * (1 - 0.6 * prog(t(), s + d + 0.6, s + d + 2.5)) * (1 - prog(t(), T.collapse - 0.2, T.collapse))}
      />,
    ),
  );

  // network nodes
  const nodeBox = (x: number, y: number, size: number, appear: number, hit: number | null) => (
    <Rect
      position={[x, y]}
      size={size}
      stroke={() => (hit !== null && t() >= hit ? C.accent : rgba(C.line, 0.45))}
      lineWidth={1.4}
      fill={() => (hit !== null ? rgba(C.accent, 0.35 * Math.exp(-Math.max(0, t() - hit) * 2.2) * (t() >= hit ? 1 : 0)) : 'rgba(0,0,0,0)')}
      shadowBlur={() => (hit !== null && t() >= hit ? 18 : 0)}
      shadowColor={C.accent}
      scale={() => 0.6 + 0.4 * outExpo(prog(t(), appear, appear + 0.6))}
      opacity={() => outExpo(prog(t(), appear, appear + 0.5))}
    >
      <Rect size={size * 0.3} fill={() => (hit !== null && t() >= hit ? C.highlight : rgba(C.line, 0.25))} />
    </Rect>
  );
  world.add(nodeBox(EDGE.x, EDGE.y, 64, 0.35, T.packetArrive));
  range(L.spines).forEach((i) => world.add(nodeBox(spineX(i), SPINE_Y, 56, T.linksDraw + 0.1 + i * 0.06, i === L.targetSpine ? T.hopSpine + 0.6 : null)));
  range(L.leaves).forEach((j) => world.add(nodeBox(leafX(j), LEAF_Y, 48, T.linksDraw + 0.5 + j * 0.05, j === L.targetLeaf ? T.hopLeaf + 0.7 : null)));

  // ping rings when the packet lands on a node
  [[EDGE, T.packetArrive], [SPINE, T.hopSpine + 0.6], [LEAF, T.hopLeaf + 0.7]].forEach(([p, at]) => {
    const pt = p as typeof EDGE;
    const s = at as number;
    world.add(
      <Circle
        position={[pt.x, pt.y]}
        size={() => 40 + 220 * outExpo(prog(t(), s, s + 1.1))}
        stroke={C.accent}
        lineWidth={1.5}
        opacity={() => (t() >= s ? 0.8 * (1 - prog(t(), s, s + 1.1)) : 0)}
      />,
    );
  });

  // labels
  const request = spec.copy.request;
  world.add(liveText(
    <Txt
      {...txt}
      text=""
      fontSize={18}
      fill={C.highlight}
      offsetX={1}
      position={[EDGE.x - 60, EDGE.y - 36]}
      opacity={() => 1 - prog(t(), T.pullBack + 0.6, T.pullBack + 1.2)}
    /> as Txt,
    () => request.slice(0, Math.floor(prog(t(), T.requestLabel, T.requestLabel + 0.8) * request.length)),
  ));
  const network = spec.copy.network;
  world.add(liveText(
    <Txt
      {...txt}
      text=""
      fontSize={18}
      fill={rgba(C.line, 0.55)}
      offsetX={-1}
      position={[EDGE.x + 60, EDGE.y]}
    /> as Txt,
    () => network.slice(0, Math.floor(prog(t(), T.networkLabel, T.networkLabel + 0.6) * network.length)),
  ));

  // -------------------------------------------------------------- racks ----
  range(L.racks).forEach((i) => {
    const rise = () => outExpo(prog(t(), T.racksIn + i * 0.07, T.racksIn + i * 0.07 + 0.9));
    const rack = (
      <Node y={() => 60 * (1 - rise())} opacity={rise}>
        <Rect
          position={[rackX(i), RACK.top + RACK.h / 2]}
          size={[RACK.w, RACK.h]}
          stroke={rgba(C.line, 0.4)}
          lineWidth={1.3}
        />
      </Node>
    ) as Node;
    range(L.slotsPerRack).forEach((j) => {
      const a = () => slotActivation(t(), i, j);
      const h = hash(i, j);
      rack.add(
        <Rect
          position={[rackX(i) - 6, slotY(j) + 9.5]}
          size={[98, 19]}
          stroke={rgba(C.line, 0.12)}
          lineWidth={1}
          fill={() => rgba(C.accent, a() * (0.18 + 0.32 * (0.6 + 0.4 * Math.sin(t() * (4 + h * 5) + h * 9))))}
        />,
      );
      rack.add(
        <Circle
          position={[rackX(i) + 51, slotY(j) + 9.5]}
          size={5}
          fill={() => {
            const blink = frac(t() * (0.7 + h * 1.6) + h) > 0.35 ? 1 : 0.25;
            return a() > 0.05 ? rgba(C.highlight, 0.95 * blink) : rgba(C.line, 0.3 * blink);
          }}
        />,
      );
    });
    world.add(rack);
  });
  // raised floor
  world.add(
    <Line
      points={[[-640, RACK.top + RACK.h + 2], [640, RACK.top + RACK.h + 2]]}
      stroke={rgba(C.line, 0.3)}
      lineWidth={1.2}
      end={() => outExpo(prog(t(), T.racksIn, T.racksIn + 1.2))}
    />,
  );

  // ---------------------------------------------------------- airflow ----
  const air = () => outExpo(prog(t(), T.cooling, T.cooling + 0.8)) * (1 - prog(t(), T.collapse - 0.3, T.collapse + 0.1));
  const lanes = L.racks + 1;
  range(54).forEach((k) => {
    // cold air rises from the floor through the gaps between racks
    const lane = k % lanes;
    const x = rackX(0) - RACK.step / 2 + lane * RACK.step + (hash(k, 3) - 0.5) * 26;
    const sp = 0.45 + hash(k, 4) * 0.35;
    const ph = hash(k, 5);
    const f = () => frac(ph + (t() - T.cooling) * sp);
    world.add(
      <Line
        points={() => {
          const y = RACK.top + RACK.h + 40 - f() * (RACK.h + 30);
          return [[x, y], [x, y + 22]];
        }}
        stroke={C.line}
        lineWidth={1.4}
        opacity={() => 0.4 * Math.sin(Math.PI * f()) * air()}
      />,
    );
  });
  range(60).forEach((k) => {
    // hot exhaust rises off the racks in the accent color
    const rack = k % L.racks;
    const x0 = rackX(rack) + (hash(k, 7) - 0.5) * 100;
    const sp = 0.5 + hash(k, 8) * 0.4;
    const ph = hash(k, 9);
    const f = () => frac(ph + (t() - T.cooling) * sp);
    world.add(
      <Line
        points={() => {
          const y = RACK.top - 6 - f() * 300;
          const x = x0 + Math.sin(f() * 7 + k) * 10;
          return [[x, y], [x, y + 26]];
        }}
        stroke={C.accent}
        lineWidth={1.8}
        shadowBlur={10}
        shadowColor={C.accent}
        opacity={() => 0.75 * Math.sin(Math.PI * f()) * air()}
      />,
    );
  });

  // ------------------------------------------------- response tokens ----
  const respPath = [RACK_IN, {x: LEAF.x, y: LEAF.y + 24}, {x: LEAF.x, y: LEAF.y - 24}, {x: SPINE.x, y: SPINE.y + 28}, {x: SPINE.x, y: -900}];
  const along = (k: number) => {
    const seg = respPath.length - 1;
    const kk = clamp(k) * seg;
    const i = Math.min(seg - 1, Math.floor(kk));
    const f = kk - i;
    return {x: respPath[i].x + (respPath[i + 1].x - respPath[i].x) * f, y: respPath[i].y + (respPath[i + 1].y - respPath[i].y) * f};
  };
  range(10).forEach((k) => {
    const s = T.response + k * 0.06;
    const p = () => along(inOutExpo(prog(t(), s, s + 0.9)));
    world.add(
      <Circle
        position={() => [p().x, p().y]}
        size={k === 0 ? 12 : 7}
        fill={k === 0 ? C.highlight : C.accent}
        shadowBlur={16}
        shadowColor={C.accent}
        opacity={() => (t() >= s && t() < s + 0.95 ? 1 - 0.07 * k : 0)}
      />,
    );
  });

  // ------------------------------------------------------------ packet ----
  world.add(
    <Circle
      position={() => [packet(t()).x, packet(t()).y]}
      size={() => 14 * (1 + 0.25 * Math.sin(t() * 8) * prog(t(), T.packetArrive, T.packetArrive + 0.2) * (1 - prog(t(), T.hopSpine - 0.1, T.hopSpine)))}
      fill={C.highlight}
      shadowBlur={24}
      shadowColor={C.accent}
      opacity={() => packet(t()).opacity}
    />,
  );

  // --------------------------------------------------------------- HUD ----
  const hudIn = () => outExpo(prog(t(), T.stats - 0.1, T.stats + 0.6)) * (1 - prog(t(), T.collapse - 0.2, T.collapse + 0.2));
  const hud = (<Node position={[700, -190]} opacity={hudIn} x={() => 700 + 40 * (1 - hudIn())} />) as Node;
  view.add(hud);
  hud.add(<Line points={[[-28, -10], [-28, 420]]} stroke={rgba(C.line, 0.16)} lineWidth={1} end={hudIn} />);
  const maxes = [100, 50, 15000];
  spec.copy.stats.forEach((s, k) => {
    const at = T.stats + k * 0.18;
    const n = () => outExpo(prog(t(), at, at + 1.6));
    const y = k * 92;
    hud.add(<Txt {...txt} text={s.label} fontSize={16} fill={rgba(C.line, 0.5)} offsetX={-1} position={[0, y]} />);
    hud.add(liveText(
      <Txt
        {...txt}
        text=""
        fontSize={34}
        fontWeight={500}
        fill={C.highlight}
        shadowBlur={12}
        shadowColor={rgba(C.accent, 0.7)}
        offsetX={-1}
        position={[0, y + 34]}
      /> as Txt,
      () => fmt(s.value * n(), s.decimals) + s.unit,
    ));
    hud.add(<Rect offsetX={-1} position={[0, y + 62]} size={[220, 3]} fill={rgba(C.line, 0.1)} />);
    hud.add(<Rect offsetX={-1} position={[0, y + 62]} size={() => [220 * (s.value / maxes[k]) * n(), 3]} fill={C.accent} shadowBlur={8} shadowColor={C.accent} />);
  });
  spec.copy.temps.forEach((s, k) => {
    const at = T.temps + k * 0.2;
    const n = () => outExpo(prog(t(), at, at + 1.4));
    const y = 3 * 92 + 26 + k * 56;
    hud.add(
      <Txt {...txt} text={s.label} fontSize={16} fill={rgba(C.line, 0.5)} offsetX={-1} position={[0, y]} opacity={() => prog(t(), at, at + 0.3)} />,
    );
    hud.add(liveText(
      <Txt
        {...txt}
        text=""
        fontSize={26}
        fill={k === 0 ? rgba(C.line, 0.85) : C.accent}
        offsetX={1}
        position={[220, y]}
        opacity={() => prog(t(), at, at + 0.3)}
      /> as Txt,
      () => Math.round(s.value * n()) + s.unit,
    ));
  });

  // ---------------------------------------------------- point + end card ----
  const SIZE = 22;
  const end = spec.copy.endCard;
  const TW = end.length * SIZE * 0.6 * 1.08;
  const born = () => smooth(prog(t(), T.collapse + 0.55, T.point));
  const pulse = () => Math.exp(-Math.max(0, t() - T.point) * 3.5) * (t() >= T.point ? 1 : 0.4);
  const rev = () => inOutExpo(prog(t(), T.endReveal, T.endReveal + T.endRevealDur));
  const pre = () => outExpo(prog(t(), T.endReveal - 0.35, T.endReveal));
  const px = () => (-TW / 2) * pre() + TW * rev() + 10 * rev();
  const toCaret = () => smooth(prog(rev(), 0.85, 1));
  const blink = () => {
    const a = t() - (T.endReveal + T.endRevealDur);
    return a > 0 && a < 1.2 ? clamp(0.5 + 1.6 * Math.cos(a * Math.PI * 2 * 1.6)) : 1;
  };
  const fadeOut = () => outExpo(prog(t(), T.fadeOut, duration - 0.04));

  view.add(
    <Rect
      offsetX={-1}
      x={-TW / 2}
      size={() => [rev() > 0 ? Math.max(0, px() + TW / 2) : 0, 80]}
      clip
      opacity={() => 1 - fadeOut()}
    >
      <Txt {...txt} text={end} fontSize={SIZE} letterSpacing={() => SIZE * (0.05 + 0.08 * (1 - rev()))} fill={rgba(C.line, 0.92)} offsetX={-1} x={-1} />
    </Rect>,
  );
  view.add(
    <Rect
      x={px}
      size={() => {
        const r = born() * 7 * (1 + 0.6 * pulse());
        return [r * 2 * (1 - toCaret()) + 10 * toCaret(), r * 2 * (1 - toCaret()) + SIZE * 1.05 * toCaret()];
      }}
      radius={() => 50 * (1 - toCaret())}
      fill={() => (toCaret() > 0.5 ? C.accent : C.highlight)}
      shadowBlur={() => 30 * born() * (1 + 1.5 * pulse())}
      shadowColor={C.accent}
      opacity={() => born() * blink() * (1 - fadeOut())}
    />,
  );

  // fade to black
  view.add(<Rect size={[W, H]} fill={C.bg} opacity={fadeOut} />);

  // frame loop: advance the master clock exactly one frame per yield
  const fps = spec.video.fps;
  for (let f = 0; f < duration * fps; f++) {
    time(f / fps);
    updaters.forEach((u) => u());
    yield;
  }
});
