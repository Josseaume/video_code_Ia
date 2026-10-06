/**
 * Kit « institutionnel » — portage Revideo de src/kit/ (Remotion).
 *
 * Même principe que l'original : chaque brique est une fonction de l'image courante.
 * En Remotion on appelle useCurrentFrame() ; ici useFrame() renvoie un « getter » de l'image
 * locale de la scène, et chaque propriété animée est une petite fonction `() => valeur`
 * que Revideo réévalue à chaque image.
 *
 * Repère : comme en CSS, (0,0) = coin haut-gauche de la scène, x vers la droite, y vers le bas.
 * Revideo place ses nœuds par leur CENTRE, d'où les `x + w / 2` un peu partout.
 */
import {Circle, Gradient, Img, Line, Node, Path, Rect, Txt, blur} from '@revideo/2d';
import type {ComponentChildren} from '@revideo/2d';
import {
  ASCENT, BURST_COLORS, CONTENT_H, DEFAULT_CLUSTER, Ease, FLOW_PATHS, FONT, FONT_TNUM, H, K, MAP, OISE, W,
  clamp01, fmtFr, interp, projectMap, rnd, spring,
} from '../../shared/core.js';
import photoSizes from '../../shared/photos.json';

export {DEFAULT_CLUSTER, K};

// ------------------------------------------------------------ contexte ----
type Getter = () => number;
let currentFrame: Getter = () => 0;
let currentUpdaters: (() => void)[] = [];
/** Image locale de la scène en cours de construction (équivalent de useCurrentFrame). */
export const useFrame = () => currentFrame;
/** Construit une scène en lui fournissant son horloge ; renvoie aussi ses « updaters » de texte. */
export const buildScene = (frame: Getter, build: () => Node) => {
  const prev = [currentFrame, currentUpdaters] as const;
  currentFrame = frame;
  currentUpdaters = [];
  const node = build();
  const updaters = currentUpdaters;
  [currentFrame, currentUpdaters] = prev;
  return {node, updaters};
};
/**
 * Texte dont le contenu change (compteurs). En Revideo 0.11 un Txt dont `text` est calculé
 * plante au rendu : on pousse donc la nouvelle chaîne à chaque image depuis la boucle principale.
 */
const liveText = (node: Txt, value: () => string) => {
  currentUpdaters.push(() => {
    const v = value();
    if (node.text() !== v) node.text(v);
  });
  return node;
};

// ------------------------------------------------------------- photos ----
const photoUrls = import.meta.glob('../../../public/photos/*.jpg', {eager: true, query: '?url', import: 'default'}) as Record<string, string>;
const photoUrl = (name: string) => photoUrls[`../../../public/photos/${name}.jpg`];
const sizes = photoSizes as unknown as Record<string, [number, number]>;

/** Photo qui remplit une boîte w×h (comme object-fit: cover), centrée, avec un lent zoom. */
export const Cover = ({name, w, h, zoom = [1.04, 1.14], duration = 180, composite}: {
  name: string; w: number; h: number; zoom?: [number, number]; duration?: number; composite?: GlobalCompositeOperation;
}) => {
  const f = useFrame();
  const [iw, ih] = sizes[name];
  const k = Math.max(w / iw, h / ih);
  // Pas de clamp, comme interpolate() par défaut dans l'original : le zoom continue après `duration`.
  const scale = () => zoom[0] + ((zoom[1] - zoom[0]) * f()) / duration;
  return <Img src={photoUrl(name)} width={iw * k} height={ih * k} scale={scale} compositeOperation={composite} />;
};

/** Photo plein cadre. */
export const Photo = (p: {name: string; zoom?: [number, number]; duration?: number}) => (
  <Rect clip size={[W, H]} position={[W / 2, H / 2]}>
    <Cover {...p} w={W} h={H} />
  </Rect>
);

const linear = (x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) =>
  new Gradient({type: 'linear', from: [x0, y0], to: [x1, y1], stops: stops.map(([offset, color]) => ({offset, color}))});
/** Dégradé plein écran gauche → droite (lisibilité des textes sur photo). */
export const ShadeRight = ({from, to, end}: {from: string; to: string; end: number}) => (
  <Rect size={[W, H]} position={[W / 2, H / 2]} fill={linear(-W / 2, 0, W / 2, 0, [[0, from], [end, to], [1, to]])} />
);

// ----------------------------------------------------- vignette, carré ----
export type Box = {x: number; y: number; w: number; h: number};

/** Vignette photo qui « pop » depuis son centre, puis zoome doucement. */
export const Tile = ({name, x, y, w, h, delay = 0, shade = false}: Box & {name: string; delay?: number; shade?: boolean}) => {
  const f = useFrame();
  const s = () => spring(f() - delay, {damping: 15, stiffness: 140});
  const open = () => 1 - 2 * ((1 - Math.min(1, s())) * 0.5); // 1 - 2 × inset
  return (
    <Node position={[x + w / 2, y + h / 2]} scale={() => 0.85 + 0.15 * s()}>
      <Rect clip size={() => [w * open(), h * open()]}>
        <Cover name={name} w={w} h={h} zoom={[1.2, 1.05]} duration={120} />
        {shade ? <Rect size={[w, h]} fill={linear(0, -h / 2, 0, h / 2, [[0, 'rgba(0,0,0,0.6)'], [0.55, 'rgba(0,0,0,0)']])} /> : null}
      </Rect>
    </Node>
  );
};

/** Carré de couleur plein (accent du style institutionnel). */
export const Square = ({x, y, size, color, delay = 0}: {x: number; y: number; size: number; color: string; delay?: number}) => {
  const f = useFrame();
  const s = () => spring(f() - delay, {damping: 11, stiffness: 160});
  return <Rect position={[x + size / 2, y + size / 2]} size={size} fill={color} scale={s} rotation={() => (1 - s()) * 90} />;
};

// --------------------------------------------------------------- texte ----
export type Weight = 300 | 400 | 600 | 800;
export type TextLine = {text: string; weight?: Weight; color?: string; size?: number};
type Align = 'left' | 'right' | 'center';
const anchor = (a: Align) => (a === 'left' ? -1 : a === 'right' ? 1 : 0);

/**
 * Une ligne de texte posée comme en CSS : `top` = haut de la boîte de ligne, `lh` = line-height.
 * (Txt est ancré par son coin haut, à gauche / au centre / à droite selon l'alignement.)
 */
const Label = ({text, x = 0, top = 0, size, weight = 800, color, lh = CONTENT_H, align = 'left', spacing = 0, shadow = false, ...rest}: {
  text: string; x?: number; top?: number; size: number; weight?: number; color: string; lh?: number; align?: Align;
  spacing?: number | (() => number); shadow?: boolean; [key: string]: unknown;
}) => (
  <Txt
    text={text}
    fontFamily={FONT}
    fontWeight={weight}
    fontSize={size}
    fill={color}
    letterSpacing={spacing}
    lineHeight={lh * size}
    offset={[anchor(align), -1]}
    position={[x, top]}
    shadowColor={shadow ? 'rgba(0,0,0,0.35)' : undefined}
    shadowBlur={shadow ? 18 : 0}
    shadowOffsetY={shadow ? 2 : 0}
    {...rest}
  />
);
/** Variante : on donne la ligne de base (comme <text y=…> en SVG). */
const LabelAtBaseline = (p: Parameters<typeof Label>[0] & {baseline: number}) => <Label {...p} top={p.baseline - ASCENT * p.size} lh={CONTENT_H} />;

const measureCtx = document.createElement('canvas').getContext('2d')!;
/** Largeur d'un texte en pixels (police chargée avant la construction des scènes). */
export const measure = (text: string, size: number, weight: number, spacing = 0) => {
  measureCtx.font = `${weight} ${size}px ${FONT}`;
  (measureCtx as unknown as {letterSpacing: string}).letterSpacing = `${spacing}px`;
  return measureCtx.measureText(text).width;
};

const styled = (line: TextLine, fallback: number) => {
  const weight = line.weight ?? 800;
  const size = line.size ?? fallback;
  return {text: line.text.toUpperCase(), weight, size, color: line.color ?? K.burgundy, spacing: (weight >= 600 ? 0.01 : 0.03) * size};
};

export type RevealMode = 'rise' | 'spread';

/** Bloc de lignes révélées l'une après l'autre : « rise » (monte derrière un masque) ou « spread » (flou + lettres espacées). */
export const TextBlock = ({lines, x, y, delay = 0, stagger = 5, size, mode = 'rise', align = 'left'}: {
  lines: TextLine[]; x: number; y: number; delay?: number; stagger?: number; size?: number; mode?: RevealMode; align?: Align;
}) => {
  const f = useFrame();
  let top = y;
  const nodes = lines.map((line, i) => {
    const st = styled(line, size ?? (mode === 'rise' ? 56 : 40));
    const lineH = st.size * 1.05;
    const d = delay + i * stagger;
    const lineTop = top;
    if (mode === 'rise') {
      top += lineH + 4;
      const s = () => spring(f() - d, {damping: 200, stiffness: 120});
      const boxW = 2400; // masque large : seule sa hauteur compte
      return (
        <Rect clip size={[boxW, lineH + 4]} position={[x - anchor(align) * (boxW / 2), lineTop + (lineH + 4) / 2]}>
          <Node y={() => (1 - s()) * 1.1 * lineH}>
            <Label {...st} lh={1.05} align={align} x={anchor(align) * (boxW / 2)} top={-(lineH + 4) / 2} />
          </Node>
        </Rect>
      );
    }
    top += lineH;
    const p = () => interp(f() - d, [0, 16], [0, 1], Ease.outCubic);
    return (
      <Label
        {...st}
        lh={1.05}
        align={align}
        x={x}
        top={lineTop}
        spacing={() => ((1 - p()) * 0.5 + 0.01) * st.size}
        opacity={p}
        filters={[blur(() => (1 - p()) * 10)]}
      />
    );
  });
  return <Node>{nodes}</Node>;
};

// ------------------------------------------------------- ligne souple ----
export type FlowName = keyof typeof FLOW_PATHS;
/** Ligne fine qui se dessine (tête) puis s'efface par l'arrière (queue). */
export const FlowLine = ({path = 'sweep', color = K.line, width = 2.5, delay = 0, draw = 45, tailDelay = null}: {
  path?: FlowName; color?: string; width?: number; delay?: number; draw?: number; tailDelay?: number | null;
}) => {
  const f = useFrame();
  const head = () => interp(f() - delay, [0, draw], [0, 1], Ease.inOutCubic);
  const tail = () => (tailDelay === null ? 0 : interp(f() - delay - tailDelay, [0, draw], [0, 1], Ease.inOutCubic));
  return (
    <Path
      data={FLOW_PATHS[path]}
      stroke={color}
      lineWidth={width}
      lineCap="round"
      start={tail}
      end={head}
      opacity={() => (head() - tail() > 0.0005 ? 1 : 0)}
    />
  );
};

// ------------------------------------------------------------- formes ----
const Triangle = ({size, color, points}: {size: number; color: string; points: [number, number][]}) => (
  <Line closed fill={color} points={points.map(([px, py]) => [(px / 100 - 0.5) * size, (py / 100 - 0.5) * size] as [number, number])} />
);

/** Salve de formes qui traversent l'écran à grande vitesse (flou de mouvement simulé). */
export const ShapeBurst = ({count = 26, seed = 'burst', delay = 0, duration = 28}: {count?: number; seed?: string; delay?: number; duration?: number}) => {
  const f = useFrame();
  return (
    <Node>
      {Array.from({length: count}, (_, i) => {
        const r = (k: string) => rnd(`${seed}-${k}-${i}`);
        const start = delay + r('start') * 10;
        const p = () => interp(f(), [start, start + duration * (0.7 + r('speed') * 0.6)], [0, 1], Ease.outCubic);
        const fromX = 2100 + r('fx') * 300;
        const toX = -300 - r('tx') * 300;
        const y = 80 + r('y') * 920;
        const size = 14 + r('size') * 46;
        const color = BURST_COLORS[i % BURST_COLORS.length];
        const rot = r('rot') * 360;
        return (
          <Node
            position={() => [fromX + (toX - fromX) * p() + size / 2, y + Math.sin(p() * 6 + i) * 30 + size / 2]}
            rotation={() => rot + p() * 180}
            scale={() => [1 + (1 - p()) * 1.8, 1]}
            opacity={() => (p() <= 0 || p() >= 1 ? 0 : 1)}
            filters={[blur(() => (1 - p()) * 6)]}
          >
            {r('kind') > 0.8 ? <Triangle size={size} color={color} points={[[50, 6], [96, 94], [4, 94]]} /> : <Rect size={size} fill={color} />}
          </Node>
        );
      })}
    </Node>
  );
};

export type ClusterSquare = {dx: number; dy: number; size: number; color: string};
/** Grappe de carrés : chacun arrive de loin en tournant, se pose, puis flotte légèrement. */
export const SquareCluster = ({x, y, squares, delay = 0, seed = 'cluster', scale = 1}: {
  x: number; y: number; squares: ClusterSquare[]; delay?: number; seed?: string; scale?: number;
}) => {
  const f = useFrame();
  return (
    <Node position={[x, y]} scale={scale}>
      {squares.map((sq, i) => {
        const s = () => spring(f() - delay - i * 2, {damping: 14, stiffness: 90});
        const angle = rnd(`${seed}-a-${i}`) * Math.PI * 2;
        return (
          <Rect
            size={sq.size}
            fill={sq.color}
            position={() => [sq.dx + Math.cos(angle) * 900 * (1 - s()), sq.dy + Math.sin(angle) * 900 * (1 - s()) + Math.sin((f() + i * 20) / 22) * 4]}
            rotation={() => (1 - s()) * 270}
            opacity={() => (s() > 0.02 ? 1 : 0)}
          />
        );
      })}
    </Node>
  );
};

/** Logo du projet (fictif) : marque en 4 carrés + nom en deux graisses. `cx, cy` = centre du logo. */
export const ProjectLogo = ({name, size = 90, delay = 0, cx = W / 2, cy = H / 2}: {name: string[]; size?: number; delay?: number; cx?: number; cy?: number}) => {
  const f = useFrame();
  const mark = () => spring(f() - delay, {damping: 12});
  const word = () => interp(f() - delay, [6, 22], [0, 1], Ease.outCubic);
  const unit = size * 0.36;
  const markW = unit * 2.12;
  const spacing = -0.01 * size;
  const w0 = measure(name[0], size, 300, spacing);
  const w1 = measure(name[1], size, 800, spacing);
  const total = markW + size * 0.28 + w0 + w1;
  const left = cx - total / 2;
  const textLeft = left + markW + size * 0.28;
  const colors = [K.lime, K.green, K.orange, K.teal];
  return (
    <Node>
      <Node position={[left + markW / 2, cy]} rotation={() => (1 - mark()) * -90} scale={mark}>
        {colors.map((c, i) => (
          <Rect size={unit} fill={c} position={[(i % 2) * unit * 1.12 + unit / 2 - markW / 2, Math.floor(i / 2) * unit * 1.12 + unit / 2 - markW / 2]} />
        ))}
      </Node>
      {/* le nom se dévoile de gauche à droite en glissant de 30 px */}
      <Node x={() => (1 - word()) * -30}>
        <Rect clip size={() => [(w0 + w1) * word(), size * 1.3]} position={() => [textLeft + ((w0 + w1) * word()) / 2, cy]}>
          <Node x={() => -((w0 + w1) * word()) / 2}>
            <Label text={name[0]} size={size} weight={300} color={K.green} lh={1} spacing={spacing} x={0} top={-size / 2} />
            <Label text={name[1]} size={size} weight={800} color={K.green} lh={1} spacing={spacing} x={w0} top={-size / 2} />
          </Node>
        </Rect>
      </Node>
    </Node>
  );
};

/** Carré de couleur contenant le logo en blanc (le « badge » des vidéos institutionnelles). */
export const Badge = ({x, y, size, color = K.orange, delay = 0, label = ['oise', 'datapark']}: {
  x: number; y: number; size: number; color?: string; delay?: number; label?: string[];
}) => {
  const f = useFrame();
  const s = () => spring(f() - delay, {damping: 13, stiffness: 150});
  const fs = size * 0.2;
  const blockW = Math.max(measure(label[0], fs, 300), measure(label[1], fs, 800));
  const lineH = fs * 0.95;
  return (
    <Rect position={[x + size / 2, y + size / 2]} size={size} fill={color} scale={s} shadowColor="rgba(0,0,0,0.12)" shadowBlur={24} shadowOffsetY={6}>
      <Node opacity={() => interp(f() - delay, [6, 14], [0, 1])}>
        <Label text={label[0]} size={fs} weight={300} color="white" lh={0.95} x={-blockW / 2} top={-lineH} />
        <Label text={label[1]} size={fs} weight={800} color="white" lh={0.95} x={-blockW / 2} top={0} />
      </Node>
    </Rect>
  );
};

// -------------------------------------------------------------- effets ----
/** Voile de couleur plein écran en mode « produit » (flash vert anis). */
export const ColorWash = ({color = K.lime, at, hold = 6, max = 0.75}: {color?: string; at: number; hold?: number; max?: number}) => {
  const f = useFrame();
  return (
    <Rect
      size={[W, H]}
      position={[W / 2, H / 2]}
      fill={color}
      compositeOperation="multiply"
      opacity={() => interp(f(), [at, at + 5, at + 5 + hold, at + 14 + hold], [0, max, max, 0])}
    />
  );
};
/** Voile fixe en mode « produit » dont on anime l'opacité (ouverture sur photo). */
const Veil = ({color, opacity}: {color: string; opacity: () => number}) => (
  <Rect size={[W, H]} position={[W / 2, H / 2]} fill={color} compositeOperation="multiply" opacity={opacity} />
);

/** Triangle qui arrive en tournant puis fonce vers la caméra (ou se rétracte). */
export const TriangleZoom = ({color = K.orange, delay = 0, x = 960, y = 540, exit = 'zoom'}: {
  color?: string; delay?: number; x?: number; y?: number; exit?: 'zoom' | 'shrink';
}) => {
  const f = useFrame();
  const inS = () => spring(f() - delay, {damping: 12});
  const zoom = () =>
    exit === 'zoom' ? interp(f() - delay, [18, 32], [1, 40], Ease.inCubic) : interp(f() - delay, [16, 24], [1, 0], Ease.inBack(2));
  return (
    <Node position={[x, y]} scale={() => inS() * zoom()} rotation={() => (1 - inS()) * 180} filters={[blur(() => Math.max(0, (1 - inS()) * 8))]}>
      <Triangle size={160} color={color} points={[[50, 8], [95, 92], [5, 92]]} />
    </Node>
  );
};

/** Texte qui s'écrit lettre par lettre, chaque lettre « atterrit » depuis plus grand. */
export const TypeOn = ({text, x, y, size = 64, color = K.burgundy, delay = 0, speed = 1.3}: {
  text: string; x: number; y: number; size?: number; color?: string; delay?: number; speed?: number;
}) => {
  const f = useFrame();
  const boxH = CONTENT_H * size;
  let left = x;
  return (
    <Node>
      {text.split('').map((ch, i) => {
        const w = measure(ch, size, 800);
        const cx = left + w / 2;
        left += w;
        const p = () => interp(f() - delay - i / speed, [0, 8], [0, 1], Ease.outBack(2));
        const k = () => 2.2 - 1.2 * p();
        // CSS : scale(k) translateY(d) autour du point (50 %, 80 %) de la lettre
        const oy = y + 0.8 * boxH;
        return (
          <Node position={() => [cx, oy + k() * (-0.3 * boxH + (1 - p()) * -20)]} scale={k} opacity={() => clamp01(p() * 3)}>
            <Label text={ch} size={size} weight={800} color={color} align="center" top={-boxH / 2} />
          </Node>
        );
      })}
    </Node>
  );
};

// ------------------------------------------------------------- collage ----
export type CollageItem =
  | ({kind: 'photo'; name: string; delay?: number; shade?: boolean} & Box)
  | {kind: 'square'; x: number; y: number; size: number; color: string; delay?: number}
  | {kind: 'badge'; x: number; y: number; size: number; color?: string; delay?: number}
  | {kind: 'text'; lines: TextLine[]; x: number; y: number; size?: number; delay?: number; mode?: RevealMode; align?: 'left' | 'right'};

/** Mise en page libre (photos, carrés, badge, textes) avec une lente dérive latérale de l'ensemble. */
export const Collage = ({items, drift = -60, duration = 180}: {items: CollageItem[]; drift?: number; duration?: number}) => {
  const f = useFrame();
  return (
    <Node x={() => (drift * f()) / duration}>
      {items.map((item) => {
        switch (item.kind) {
          case 'photo':
            return <Tile {...item} />;
          case 'square':
            return <Square {...item} />;
          case 'badge':
            return <Badge {...item} />;
          case 'text':
            return <TextBlock {...item} />;
        }
      })}
    </Node>
  );
};

/** Rangée de vignettes alignées (mosaïque), centrée horizontalement. */
export const mosaicRow = (names: string[], o: {y: number; w: number; h: number; gap?: number; delay?: number; stagger?: number}): CollageItem[] => {
  const gap = o.gap ?? 14;
  const x0 = (W - (names.length * o.w + (names.length - 1) * gap)) / 2;
  return names.map((name, i) => ({kind: 'photo', name, x: x0 + i * (o.w + gap), y: o.y, w: o.w, h: o.h, delay: (o.delay ?? 0) + i * (o.stagger ?? 4)}));
};

// ---------------------------------------------------------- chiffre clé ----
export type StatLine = {text: string; big?: boolean} | {count: number; suffix?: string; big?: boolean};

/** Carte photo + carré de couleur en coin + chiffre clé qui défile. */
export const StatCard = ({name, lines, x, y, w, h, delay = 0, accent = K.orange}: Box & {name: string; lines: StatLine[]; delay?: number; accent?: string}) => {
  const f = useFrame();
  // dégradé CSS « to top right » : sa direction est perpendiculaire à la diagonale de la boîte
  const diag = Math.hypot(w, h);
  const half = (w * h) / diag;
  const [dx, dy] = [(h / diag) * half, (-w / diag) * half];
  const final = (l: StatLine) => ('count' in l ? fmtFr(l.count) + (l.suffix ?? '') : l.text.toUpperCase());
  const heights = lines.map((l) => (l.big ? 150 * 0.95 : 44 * 1.1));
  const blockW = Math.max(...lines.map((l) => measure(final(l), l.big ? 150 : 44, 800)));
  let top = y + h - 50 - heights.reduce((a, b) => a + b, 0);
  return (
    <Node>
      <Tile name={name} x={x} y={y} w={w} h={h} delay={delay} />
      <Rect
        position={[x + w / 2, y + h / 2]}
        size={[w, h]}
        fill={linear(-dx, -dy, dx, dy, [[0, 'rgba(0,0,0,0.55)'], [0.65, 'rgba(0,0,0,0)']])}
        opacity={() => interp(f() - delay, [8, 18], [0, 1])}
      />
      <Square x={x - 40} y={y - 40} size={80} color={accent} delay={delay + 4} />
      {lines.map((line, i) => {
        const d = delay + 14 + i * 6;
        const s = () => spring(f() - d, {damping: 200});
        const size = line.big ? 150 : 44;
        const lineTop = top;
        top += heights[i];
        const label = (
          <Label text={final(line)} size={size} weight={800} color="white" lh={line.big ? 0.95 : 1.1} x={-blockW / 2} top={-heights[i] / 2} fontFamily={FONT_TNUM} shadowColor="rgba(0,0,0,0.25)" shadowBlur={20} shadowOffsetY={2} />
        ) as Txt;
        if ('count' in line) liveText(label, () => fmtFr(interp(f() - d, [0, 40], [0, line.count], Ease.outQuart)) + (line.suffix ?? ''));
        return (
          <Rect clip size={[blockW, heights[i]]} position={[x + 50 + blockW / 2, lineTop + heights[i] / 2]}>
            <Node x={() => (1 - s()) * -1.1 * blockW}>{label}</Node>
          </Rect>
        );
      })}
    </Node>
  );
};

// ------------------------------------------------------- photo plein écran ----
export type KeywordGroup = {at: number; lines: TextLine[]};

/** Photo plein écran + groupes de mots-clés qui se succèdent (le suivant chasse le précédent). */
export const KeywordsOverPhoto = ({name, groups, duration, x = 140, y = 420, size = 58}: {
  name: string; groups: KeywordGroup[]; duration: number; x?: number; y?: number; size?: number;
}) => {
  const f = useFrame();
  return (
    <Node>
      <Photo name={name} duration={duration} />
      <ShadeRight from="rgba(0,0,0,0.55)" to="rgba(0,0,0,0.05)" end={0.7} />
      {groups.map((group, gi) => {
        const end = groups[gi + 1]?.at ?? duration + 100;
        const out = () => interp(f(), [end - 2, end + 6], [0, 1]);
        let top = y;
        return (
          <Node opacity={() => (f() < group.at || out() >= 1 ? 0 : 1 - out())} y={() => -out() * 40}>
            {group.lines.map((line, li) => {
              const s = () => spring(f() - group.at - li * 4, {damping: 200});
              const fs = line.size ?? size;
              const lineTop = top;
              top += fs * 1.1;
              return (
                <Node y={() => (1 - s()) * 30} opacity={s} filters={[blur(() => (1 - s()) * 8)]}>
                  <Label text={line.text.toUpperCase()} size={fs} weight={line.weight ?? 800} color={line.color ?? 'white'} lh={1.1} x={x} top={lineTop} shadow />
                </Node>
              );
            })}
          </Node>
        );
      })}
    </Node>
  );
};

/** Ouverture sur photo : l'image se dévoile de gauche à droite sous un voile de couleur, puis des mots s'empilent à droite. */
export const PhotoOpener = ({name, words, duration, color = K.lime, wordsDelay = 25, stagger = 12}: {
  name: string; words: TextLine[]; duration: number; color?: string; wordsDelay?: number; stagger?: number;
}) => {
  const f = useFrame();
  const reveal = () => spring(f(), {damping: 200, durationInFrames: 24});
  let top = 380;
  return (
    <Node>
      <Rect clip size={() => [W * reveal(), H]} position={() => [(W * reveal()) / 2, H / 2]}>
        <Node position={() => [-(W * reveal()) / 2, -H / 2]}>
          <Photo name={name} duration={duration} zoom={[1.12, 1.02]} />
          <Veil color={color} opacity={() => interp(f(), [4, 24], [0.85, 0])} />
        </Node>
      </Rect>
      {words.map((w, i) => {
        const s = () => spring(f() - wordsDelay - i * stagger, {damping: 200});
        const fs = w.size ?? 64;
        const lineTop = top;
        top += fs * 1.1;
        return (
          <Node x={() => (1 - s()) * 60} opacity={s}>
            <Label text={w.text.toUpperCase()} size={fs} weight={w.weight ?? 800} color={w.color ?? 'white'} lh={1.1} align="right" x={W - 150} top={lineTop} shadow />
          </Node>
        );
      })}
    </Node>
  );
};

/** Mots géants « remplis » par une photo, dévoilés par un balayage gauche → droite. */
export const PhotoText = ({name, words, size = 190, delay = 0, stagger = 12, duration = 200}: {
  name: string; words: string[]; size?: number; delay?: number; stagger?: number; duration?: number;
}) => {
  const f = useFrame();
  const lineH = size * 0.92;
  const top = H / 2 - (words.length * lineH) / 2;
  return (
    <Node>
      {words.map((word, i) => {
        const p = () => interp(f() - delay - i * stagger, [0, 16], [0, 1], Ease.outCubic);
        // `cache` : le groupe est dessiné à part ; la photo en « source-in » ne reste que là où il y a du texte
        return (
          <Node cache>
            <Rect clip size={() => [W * p(), H]} position={() => [(W * p()) / 2, H / 2]}>
              <Node position={() => [-(W * p()) / 2, -H / 2]}>
                <LabelAtBaseline text={word} size={size} weight={800} color="black" align="center" spacing={-size * 0.02} x={W / 2} baseline={top + (i + 1) * lineH - size * 0.14} />
              </Node>
            </Rect>
            <Node position={[W / 2, H / 2]}>
              <Cover name={name} w={W} h={H} zoom={[1.0, 1.1]} duration={duration} composite="source-in" />
            </Node>
          </Node>
        );
      })}
    </Node>
  );
};

// --------------------------------------------------------------- carte ----
export type City = {name: string; lon: number; lat: number; main?: boolean};

/** Carte de l'Oise : contour qui se trace, villes, épingle sur le site, lien pointillé vers Paris. */
export const MapOise = ({cities, site, paris, delay = 0}: {cities: City[]; site: {lon: number; lat: number; label: string}; paris: string; delay?: number}) => {
  const f = useFrame();
  const t = () => f() - delay;
  const pts = OISE.outline.map(([lon, lat]) => projectMap(lon, lat));
  const data = 'M ' + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ') + ' Z';
  const s = projectMap(site.lon, site.lat);
  const P = projectMap(2.35, 48.86);
  const pin = () => spring(t() - 60, {damping: 9, stiffness: 160});
  const link = () => interp(t(), [80, 110], [0, 1], Ease.inOutCubic);
  return (
    <Node>
      <Line closed points={pts.map((p) => [p.x, p.y] as [number, number])} fill={K.lime} opacity={() => 0.18 * interp(t(), [30, 50], [0, 1])} />
      <Path data={data} stroke={K.green} lineWidth={4} lineJoin="round" end={() => interp(t(), [0, 40], [0, 1], Ease.inOutCubic)} />
      {cities.map((c, i) => {
        const p = projectMap(c.lon, c.lat);
        const cs = () => spring(t() - 40 - i * 5, {damping: 12});
        return (
          <Node opacity={() => clamp01(cs())}>
            <Rect position={[p.x, p.y]} size={() => 14 * Math.max(0, cs())} fill={c.main ? K.burgundy : K.teal} />
            <LabelAtBaseline text={c.name.toUpperCase()} size={24} weight={c.main ? 800 : 600} color={K.text} x={p.x + 16} baseline={p.y + 7} />
          </Node>
        );
      })}
      <Line points={() => [[s.x, s.y], [s.x + (P.x - s.x) * link(), s.y + (P.y - s.y) * link()]]} stroke={K.burgundy} lineWidth={3} lineDash={[10, 10]} opacity={() => (link() > 0 ? 1 : 0)} />
      <Circle position={[P.x, P.y]} size={20} fill={K.burgundy} opacity={() => (link() > 0.98 ? 1 : 0)} />
      <LabelAtBaseline text={`PARIS · ${paris}`} size={28} weight={800} color={K.burgundy} x={P.x + 20} baseline={P.y + 8} opacity={() => interp(t(), [105, 115], [0, 1])} />
      {[0, 1, 2].map((r) => {
        const rp = () => (((t() - 70 - r * 12) % 40) + 40) % 40 / 40;
        return <Circle position={[s.x, s.y]} size={() => 2 * (20 + rp() * 90)} stroke={K.orange} lineWidth={3} opacity={() => (t() < 70 + r * 12 ? 0 : 1 - rp())} />;
      })}
      <Node position={() => [s.x, s.y - (1 - pin()) * 200]} scale={() => Math.max(0, pin())}>
        <Path data="M 0 0 C -10 -18, -26 -30, -26 -48 A 26 26 0 1 1 26 -48 C 26 -30, 10 -18, 0 0 Z" fill={K.orange} />
        <Rect position={[0, -48]} size={18} fill="white" />
      </Node>
      <LabelAtBaseline text={site.label.toUpperCase()} size={30} weight={800} color={K.orange} x={s.x + 40} baseline={s.y - 50} opacity={() => interp(t(), [72, 82], [0, 1])} />
    </Node>
  );
};

// ------------------------------------------------------ frise, compteurs ----
export type Milestone = {year: string; label: string; photo: string; color?: string};

/** Frise chronologique horizontale : la ligne se trace, chaque jalon apparaît avec sa photo. */
export const Timeline = ({milestones, y = 640, delay = 0, stagger = 22}: {milestones: Milestone[]; y?: number; delay?: number; stagger?: number}) => {
  const f = useFrame();
  const [x0, x1] = [200, 1720];
  const step = (x1 - x0) / milestones.length;
  const draw = () => interp(f() - delay, [0, 20 + milestones.length * stagger], [0, 1], Ease.inOutQuad);
  return (
    <Node>
      <Rect size={() => [(x1 - x0) * draw(), 4]} position={() => [x0 + ((x1 - x0) * draw()) / 2, y]} fill={K.line} />
      {milestones.map((m, i) => {
        const cx = x0 + step * (i + 0.5);
        const d = delay + 10 + i * stagger;
        const s = () => spring(f() - d, {damping: 12});
        const color = m.color ?? [K.green, K.orange, K.teal, K.burgundy][i % 4];
        return (
          <Node>
            <Tile name={m.photo} x={cx - 170} y={y - 330} w={340} h={250} delay={d + 2} />
            <Rect position={[cx, y]} size={36} fill={color} scale={s} rotation={() => (1 - s()) * 90} />
            <Node y={() => (1 - s()) * 30} opacity={() => clamp01(s())}>
              <Label text={m.year} size={64} weight={800} color={color} align="center" x={cx} top={y + 40} />
              <Label text={m.label.toUpperCase()} size={26} weight={600} color={K.text} align="center" spacing={0.04 * 26} x={cx} top={y + 40 + 64 * CONTENT_H} />
            </Node>
          </Node>
        );
      })}
    </Node>
  );
};

export type Counter = {value: number; suffix?: string; label: string; color?: string};

/** Rangée de chiffres clés qui défilent, chacun coiffé d'un carré de couleur. */
export const Counters = ({items, y = 380, delay = 0, stagger = 8}: {items: Counter[]; y?: number; delay?: number; stagger?: number}) => {
  const f = useFrame();
  const colW = 1600 / items.length;
  return (
    <Node>
      {items.map((item, i) => {
        const d = delay + i * stagger;
        const s = () => spring(f() - d, {damping: 13});
        const color = item.color ?? [K.green, K.orange, K.teal][i % 3];
        const cx = 160 + i * colW + colW / 2;
        const number = (<Label text="0" size={140} weight={800} color={color} lh={1} align="center" fontFamily={FONT_TNUM} x={cx} top={y + 76} opacity={() => clamp01(s() * 2)} />) as Txt;
        liveText(number, () => fmtFr(interp(f() - d, [0, 45], [0, item.value], Ease.outQuart)) + (item.suffix ?? ''));
        return (
          <Node>
            <Rect position={[cx, y + 23]} size={46} fill={color} scale={s} rotation={() => (1 - s()) * 180} />
            {number}
            <Label text={item.label.toUpperCase()} size={30} weight={600} color={K.text} align="center" spacing={0.05 * 30} x={cx} top={y + 76 + 140 + 16} opacity={() => interp(f() - d, [15, 28], [0, 1])} />
          </Node>
        );
      })}
    </Node>
  );
};

export type {ComponentChildren};
