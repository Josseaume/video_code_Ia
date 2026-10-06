/**
 * Les 14 scènes de « Data center dans l'Oise » — même contenu et mêmes réglages que
 * src/datacenter/scenes.tsx (Remotion), écrits avec le kit Revideo.
 */
import {Node} from '@revideo/2d';
import {H, PROJECT as P, W, fmtFr} from '../../shared/core.js';
import {
  Badge, Collage, ColorWash, Counters, DEFAULT_CLUSTER, FlowLine, K, KeywordsOverPhoto, MapOise, Photo, PhotoOpener,
  PhotoText, ProjectLogo, ShadeRight, ShapeBurst, SquareCluster, StatCard, TextBlock, Timeline, TriangleZoom, TypeOn,
  mosaicRow, useFrame,
} from './kit';
import {Txt} from '@revideo/2d';
import {FONT} from '../../shared/core.js';

// Petit badge permanent en bas à droite, comme la signature des vidéos institutionnelles.
const CornerBadge = () => <Badge x={1720} y={900} size={96} color={K.orange} delay={10} label={P.name} />;

// 1 — Ouverture : salve de formes, triangle, grappe de carrés et logo.
const Ouverture = () => (
  <Node>
    <ShapeBurst delay={0} duration={30} />
    <TriangleZoom delay={12} color={K.green} exit="shrink" />
    <SquareCluster x={470} y={540} squares={DEFAULT_CLUSTER} delay={30} scale={1.1} />
    <ProjectLogo name={P.name} size={120} delay={42} />
    <TextBlock lines={[{text: P.tagline, weight: 400, color: K.burgundy, size: 34}]} delay={66} mode="spread" align="center" x={W / 2} y={640} />
    <FlowLine path="sweep" delay={48} draw={50} tailDelay={45} />
  </Node>
);

// 2 — Le territoire : la photo se dévoile, les mots s'empilent.
const Territoire = () => (
  <Node>
    <PhotoOpener
      name="fields2"
      duration={170}
      words={[{text: 'Territoire'}, {text: 'Énergie'}, {text: 'Numérique'}, {text: 'Emploi'}, {text: '…', weight: 300}]}
    />
    <FlowLine path="high" color="rgba(255,255,255,0.85)" delay={20} draw={60} />
  </Node>
);

// 3 — La question : titre deux tons + mosaïque + réponse, puis flash vert anis.
const Question = () => (
  <Node>
    <Collage
      duration={200}
      items={[
        {
          kind: 'text', x: 279, y: 150, size: 40,
          lines: [
            {text: 'Comment accueillir', weight: 800, size: 46},
            {text: 'le numérique de demain', weight: 400},
            {text: 'sans oublier le territoire ?', weight: 400},
          ],
        },
        ...mosaicRow(['servers2', 'fields1', 'creil', 'power'], {y: 360, w: 330, h: 330, delay: 14}),
        {kind: 'text', x: 279, y: 730, delay: 70, lines: [{text: 'Nous avons', color: K.lime, size: 54}, {text: 'un projet', color: K.lime, size: 54}]},
      ]}
    />
    <FlowLine path="sweep" color="rgba(255,255,255,0.95)" delay={24} draw={60} />
    <ColorWash at={150} hold={10} />
  </Node>
);

// 4 — Présentation : mosaïque avec badge central et nom du projet.
const Presentation = () => {
  const x0 = (W - (4 * 300 + 3 * 14)) / 2;
  return (
    <Node>
      <FlowLine path="high" delay={0} draw={60} />
      <Collage
        duration={170}
        items={[
          {kind: 'photo', name: 'servers4', x: x0, y: 230, w: 300, h: 300, delay: 0},
          {kind: 'badge', x: x0 + 314, y: 230, size: 300, color: K.lime, delay: 6},
          {kind: 'photo', name: 'dcroof', x: x0 + 628, y: 230, w: 300, h: 300, delay: 12},
          {kind: 'photo', name: 'servers3', x: x0 + 942, y: 230, w: 300, h: 300, delay: 18},
          {
            kind: 'text', x: x0 + 628, y: 560, delay: 30, size: 34,
            lines: [{text: 'Présente', weight: 400}, {text: 'Oise Data Park', size: 56}, {text: P.tagline, weight: 400}],
          },
        ]}
      />
    </Node>
  );
};

// 5 — Le site : badge, collage photo et chiffres, textes en deux couleurs.
const Site = () => (
  <Node>
    <FlowLine path="low" delay={10} draw={60} />
    <Collage
      duration={180}
      drift={-80}
      items={[
        {kind: 'badge', x: 170, y: 380, size: 270, color: K.orange, delay: 0},
        {kind: 'text', x: 1030, y: 170, align: 'right', delay: 8, lines: [{text: 'Un site de', weight: 400, size: 40}, {text: `${P.hectares} hectares`, size: 70}]},
        {kind: 'photo', name: 'fields3', x: 1050, y: 150, w: 200, h: 200, delay: 14},
        {kind: 'photo', name: 'fields4', x: 790, y: 370, w: 340, h: 310, delay: 22},
        {kind: 'photo', name: 'crane', x: 1150, y: 370, w: 440, h: 520, delay: 30},
        {kind: 'square', x: 1610, y: 330, size: 44, color: K.lime, delay: 40},
        {
          kind: 'text', x: 170, y: 700, delay: 48, mode: 'spread',
          lines: [{text: 'Raccordé au réseau', weight: 400, color: K.green, size: 36}, {text: 'haute tension', color: K.green, size: 56}],
        },
      ]}
    />
  </Node>
);

// 6 — La carte : contour de l'Oise, villes, épingle et distance à Paris.
const Carte = () => (
  <Node>
    <TextBlock
      lines={[{text: 'Un emplacement', weight: 400, size: 44}, {text: 'stratégique', size: 78}, {text: "au cœur de l'Oise", weight: 400, color: K.green, size: 44}]}
      delay={6}
      x={160}
      y={300}
    />
    <TextBlock
      lines={[
        {text: `À ${P.parisDistance} de Paris`, weight: 600, color: K.text, size: 30},
        {text: "Desservi par l'A1 et l'A16", weight: 600, color: K.text, size: 30},
        {text: 'Fibre & haute tension', weight: 600, color: K.text, size: 30},
      ]}
      delay={90}
      stagger={8}
      mode="spread"
      x={160}
      y={560}
    />
    <MapOise cities={P.cities} site={P.site} paris={P.parisDistance} delay={10} />
    <CornerBadge />
  </Node>
);

// 7 — Chiffre clé : carte photo avec compteur.
const Puissance = () => (
  <Node>
    <FlowLine path="diagonal" delay={0} draw={60} />
    <StatCard
      name="servers1"
      x={420}
      y={170}
      w={640}
      h={740}
      delay={0}
      lines={[{text: "Jusqu'à"}, {count: P.megawatts, suffix: ' MW', big: true}, {text: 'de puissance'}, {text: 'informatique'}]}
    />
    <Collage
      duration={170}
      drift={-40}
      items={[
        {kind: 'photo', name: 'cables', x: 1100, y: 640, w: 250, h: 250, delay: 30},
        {kind: 'photo', name: 'servers2', x: 1370, y: 560, w: 200, h: 250, delay: 38},
        {
          kind: 'text', x: 1100, y: 230, delay: 44, mode: 'spread',
          lines: [{text: 'Une capacité', weight: 400, size: 38}, {text: 'pensée pour', weight: 400, size: 38}, {text: "le cloud & l'IA", size: 56, color: K.orange}],
        },
      ]}
    />
    <CornerBadge />
  </Node>
);

// 8 — La chaleur valorisée : collage avec photo principale titrée et libellés colorés.
const Chaleur = () => (
  <Node>
    <FlowLine path="high" delay={8} draw={70} tailDelay={80} />
    <Collage
      duration={200}
      drift={-90}
      items={[
        {kind: 'photo', name: 'heat', x: 160, y: 160, w: 500, h: 500, delay: 0, shade: true},
        {kind: 'text', x: 190, y: 190, delay: 10, lines: [{text: 'Une chaleur', color: 'white', size: 50}, {text: 'valorisée', color: 'white', size: 50}]},
        {kind: 'photo', name: 'greenhouse', x: 680, y: 160, w: 260, h: 330, delay: 22},
        {kind: 'text', x: 965, y: 180, delay: 28, mode: 'spread', lines: [{text: 'Serres agricoles', weight: 400, color: K.orange, size: 36}]},
        {kind: 'photo', name: 'compiegne', x: 965, y: 250, w: 300, h: 230, delay: 44},
        {kind: 'text', x: 965, y: 500, delay: 50, mode: 'spread', lines: [{text: 'Équipements publics', weight: 400, color: K.burgundy, size: 36}]},
        {kind: 'photo', name: 'oise', x: 680, y: 510, w: 260, h: 230, delay: 66},
        {
          kind: 'text', x: 160, y: 700, delay: 72, mode: 'spread',
          lines: [{text: 'Réseau de chaleur', weight: 400, color: K.green, size: 34}, {text: `≈ ${fmtFr(P.homesHeated)} logements`, color: K.green, size: 48}],
        },
      ]}
    />
    <CornerBadge />
  </Node>
);

// 9 — Mots-clés sur photo plein écran.
const MotsCles = () => (
  <KeywordsOverPhoto
    name="servers3"
    duration={210}
    groups={[
      {at: 8, lines: [{text: 'Sobriété'}, {text: 'énergétique', weight: 300}]},
      {at: 72, lines: [{text: 'Refroidissement', weight: 300}, {text: 'liquide'}, {text: 'PUE 1,2', color: K.orange}]},
      {at: 140, lines: [{text: '100 %', color: K.lime, size: 96}, {text: 'électricité'}, {text: 'bas carbone', weight: 300}]},
    ]}
  />
);

// 10 — Calendrier : frise chronologique.
const Calendrier = () => (
  <Node>
    <TextBlock lines={[{text: 'Un calendrier', weight: 400, size: 44}, {text: 'maîtrisé', size: 70}]} delay={0} x={200} y={90} />
    <Timeline milestones={P.milestones} y={680} delay={10} />
    <CornerBadge />
  </Node>
);

// 11 — Chiffres clés : compteurs.
const Chiffres = () => (
  <Node>
    <FlowLine path="low" delay={0} draw={60} />
    <TextBlock lines={[{text: 'Un projet pour le territoire', size: 56}]} delay={0} align="center" x={W / 2} y={170} />
    <Counters
      y={360}
      delay={12}
      items={[
        {value: P.jobs, label: 'emplois directs'},
        {value: P.homesHeated, label: 'logements chauffés'},
        {value: 100, suffix: ' %', label: 'électricité bas carbone'},
      ]}
    />
  </Node>
);

// 12 — Message sur photo aérienne avec badge.
const Message = () => (
  <Node>
    <Photo name="dcroof" duration={150} zoom={[1.15, 1.02]} />
    <ShadeRight from="rgba(0,0,0,0.5)" to="rgba(0,0,0,0)" end={0.6} />
    <Badge x={200} y={250} size={260} color={K.orange} delay={4} label={P.name} />
    <TextBlock
      lines={[{text: 'Un projet conçu', color: 'white', size: 50}, {text: 'pour et avec', color: 'white', size: 50, weight: 300}, {text: 'le territoire', color: 'white', size: 50}]}
      delay={18}
      x={200}
      y={560}
    />
  </Node>
);

// 13 — Mots géants remplis par une photo.
const Verbes = () => (
  <Node>
    <PhotoText name="servers1" words={P.verbs} size={180} delay={4} stagger={14} duration={190} />
    <FlowLine path="sweep" delay={30} draw={70} />
  </Node>
);

// 14 — Fin : question tapée, triangle qui fonce, logo final + crédits.
const Fin = () => {
  const f = useFrame();
  const endCard = () => f() >= 102;
  return (
    <Node>
      <Node opacity={() => (endCard() ? 0 : 1)}>
        <SquareCluster
          x={330}
          y={470}
          delay={0}
          squares={[
            {dx: 0, dy: -60, size: 40, color: K.lime},
            {dx: -40, dy: 10, size: 44, color: K.green},
            {dx: -10, dy: -10, size: 30, color: K.orange},
            {dx: 30, dy: 40, size: 20, color: K.rust},
          ]}
        />
        <TypeOn text="ET SI ON EN PARLAIT ?" x={400} y={430} size={78} delay={8} />
        <FlowLine path="low" delay={20} draw={50} tailDelay={40} />
        <TriangleZoom delay={70} />
      </Node>
      <Node opacity={() => (endCard() ? 1 : 0)}>
        <SquareCluster x={600} y={520} squares={DEFAULT_CLUSTER} delay={104} scale={0.9} />
        <ProjectLogo name={P.name} size={110} delay={110} />
        <Txt
          text="Projet fictif · Photos : Wikimedia Commons (CC BY / CC BY-SA / CC0) — auteurs listés dans CREDITS.md"
          fontFamily={FONT}
          fontSize={16}
          fill="#8a8a8a"
          position={[W / 2, H - 40 - 10]}
          opacity={() => (f() > 130 ? 1 : 0)}
        />
      </Node>
    </Node>
  );
};

/** Dans l'ordre de SCENES (shared/core.js). */
export const SCENE_BUILDERS: Record<string, () => Node> = {
  Ouverture, Territoire, Question, Presentation, Site, Carte, Puissance, Chaleur, MotsCles, Calendrier, Chiffres, Message, Verbes, Fin,
} as unknown as Record<string, () => Node>;
