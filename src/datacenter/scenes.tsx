import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {
  Badge,
  Collage,
  Counters,
  DEFAULT_CLUSTER,
  FlowLine,
  FONT,
  K,
  KeywordsOverPhoto,
  MapOise,
  mosaicRow,
  Photo,
  PhotoOpener,
  PhotoText,
  ProjectLogo,
  ShapeBurst,
  SquareCluster,
  StatCard,
  TextBlock,
  Timeline,
  TriangleZoom,
  TypeOn,
  ColorWash,
} from '../kit';
import {PROJECT as P} from './content';

const White: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: K.white, overflow: 'hidden'}}>{children}</AbsoluteFill>
);

// Petit badge permanent en bas à droite, comme la signature des vidéos institutionnelles.
const CornerBadge: React.FC<{delay?: number}> = ({delay = 10}) => (
  <Badge x={1720} y={900} size={96} color={K.orange} delay={delay} label={P.name} />
);

// 1 — Ouverture : salve de formes, triangle, grappe de carrés et logo.
export const SceneOpening: React.FC = () => (
  <White>
    <ShapeBurst delay={0} duration={30} />
    <TriangleZoom delay={12} color={K.green} exit="shrink" />
    <SquareCluster x={470} y={540} squares={DEFAULT_CLUSTER} delay={30} scale={1.1} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <ProjectLogo name={P.name} size={120} delay={42} />
    </AbsoluteFill>
    <TextBlock
      lines={[{text: P.tagline, weight: 400, color: K.burgundy, size: 34}]}
      delay={66}
      mode="spread"
      align="center"
      style={{left: 0, width: 1920, top: 640}}
    />
    <FlowLine path="sweep" delay={48} draw={50} tailDelay={45} />
  </White>
);

// 2 — Le territoire : la photo se dévoile, les mots s'empilent.
export const SceneTerritory: React.FC = () => (
  <>
    <PhotoOpener
      name="fields2"
      duration={170}
      words={[{text: 'Territoire'}, {text: 'Énergie'}, {text: 'Numérique'}, {text: 'Emploi'}, {text: '…', weight: 300}]}
    />
    <FlowLine path="high" color="rgba(255,255,255,0.85)" delay={20} draw={60} />
  </>
);

// 3 — La question : titre deux tons + mosaïque + réponse, puis flash vert anis.
export const SceneQuestion: React.FC = () => (
  <White>
    <Collage
      duration={200}
      items={[
        {
          kind: 'text',
          x: 279,
          y: 150,
          size: 40,
          lines: [
            {text: 'Comment accueillir', weight: 800, size: 46},
            {text: 'le numérique de demain', weight: 400},
            {text: 'sans oublier le territoire ?', weight: 400},
          ],
        },
        ...mosaicRow(['servers2', 'fields1', 'creil', 'power'], {y: 360, w: 330, h: 330, delay: 14}),
        {
          kind: 'text',
          x: 279,
          y: 730,
          delay: 70,
          lines: [
            {text: 'Nous avons', color: K.lime, size: 54},
            {text: 'un projet', color: K.lime, size: 54},
          ],
        },
      ]}
    />
    <FlowLine path="sweep" color="rgba(255,255,255,0.95)" delay={24} draw={60} />
    <ColorWash at={150} hold={10} />
  </White>
);

// 4 — Présentation : mosaïque avec badge central et nom du projet.
export const ScenePresentation: React.FC = () => {
  const x0 = (1920 - (4 * 300 + 3 * 14)) / 2;
  return (
    <White>
      <FlowLine path="high" delay={0} draw={60} />
      <Collage
        duration={170}
        items={[
          {kind: 'photo', name: 'servers4', x: x0, y: 230, w: 300, h: 300, delay: 0},
          {kind: 'badge', x: x0 + 314, y: 230, size: 300, color: K.lime, delay: 6},
          {kind: 'photo', name: 'dcroof', x: x0 + 628, y: 230, w: 300, h: 300, delay: 12},
          {kind: 'photo', name: 'servers3', x: x0 + 942, y: 230, w: 300, h: 300, delay: 18},
          {
            kind: 'text',
            x: x0 + 628,
            y: 560,
            delay: 30,
            size: 34,
            lines: [
              {text: 'Présente', weight: 400},
              {text: 'Oise Data Park', size: 56},
              {text: P.tagline, weight: 400},
            ],
          },
        ]}
      />
    </White>
  );
};

// 5 — Le site : badge, collage photo et chiffres, textes en deux couleurs.
export const SceneSite: React.FC = () => (
  <White>
    <FlowLine path="low" delay={10} draw={60} />
    <Collage
      duration={180}
      drift={-80}
      items={[
        {kind: 'badge', x: 170, y: 380, size: 270, color: K.orange, delay: 0},
        {
          kind: 'text',
          x: 1030,
          y: 170,
          align: 'right',
          delay: 8,
          lines: [
            {text: 'Un site de', weight: 400, size: 40},
            {text: `${P.hectares} hectares`, size: 70},
          ],
        },
        {kind: 'photo', name: 'fields3', x: 1050, y: 150, w: 200, h: 200, delay: 14},
        {kind: 'photo', name: 'fields4', x: 790, y: 370, w: 340, h: 310, delay: 22},
        {kind: 'photo', name: 'crane', x: 1150, y: 370, w: 440, h: 520, delay: 30},
        {kind: 'square', x: 1610, y: 330, size: 44, color: K.lime, delay: 40},
        {
          kind: 'text',
          x: 170,
          y: 700,
          delay: 48,
          mode: 'spread',
          lines: [
            {text: 'Raccordé au réseau', weight: 400, color: K.green, size: 36},
            {text: 'haute tension', color: K.green, size: 56},
          ],
        },
      ]}
    />
  </White>
);

// 6 — La carte : contour de l'Oise, villes, épingle et distance à Paris.
export const SceneMap: React.FC = () => (
  <White>
    <TextBlock
      lines={[
        {text: 'Un emplacement', weight: 400, size: 44},
        {text: 'stratégique', size: 78},
        {text: "au cœur de l'Oise", weight: 400, color: K.green, size: 44},
      ]}
      delay={6}
      style={{left: 160, top: 300}}
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
      style={{left: 160, top: 560}}
    />
    <MapOise cities={P.cities} site={P.site} paris={P.parisDistance} delay={10} />
    <CornerBadge />
  </White>
);

// 7 — Chiffre clé : carte photo avec compteur.
export const ScenePower: React.FC = () => (
  <White>
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
          kind: 'text',
          x: 1100,
          y: 230,
          delay: 44,
          mode: 'spread',
          lines: [
            {text: 'Une capacité', weight: 400, size: 38},
            {text: 'pensée pour', weight: 400, size: 38},
            {text: "le cloud & l'IA", size: 56, color: K.orange},
          ],
        },
      ]}
    />
    <CornerBadge />
  </White>
);

// 8 — La chaleur valorisée : collage avec photo principale titrée et libellés colorés.
export const SceneHeat: React.FC = () => (
  <White>
    <FlowLine path="high" delay={8} draw={70} tailDelay={80} />
    <Collage
      duration={200}
      drift={-90}
      items={[
        {kind: 'photo', name: 'heat', x: 160, y: 160, w: 500, h: 500, delay: 0, shade: true},
        {
          kind: 'text',
          x: 190,
          y: 190,
          delay: 10,
          lines: [
            {text: 'Une chaleur', color: 'white', size: 50},
            {text: 'valorisée', color: 'white', size: 50},
          ],
        },
        {kind: 'photo', name: 'greenhouse', x: 680, y: 160, w: 260, h: 330, delay: 22},
        {kind: 'text', x: 965, y: 180, delay: 28, mode: 'spread', lines: [{text: 'Serres agricoles', weight: 400, color: K.orange, size: 36}]},
        {kind: 'photo', name: 'compiegne', x: 965, y: 250, w: 300, h: 230, delay: 44},
        {kind: 'text', x: 965, y: 500, delay: 50, mode: 'spread', lines: [{text: 'Équipements publics', weight: 400, color: K.burgundy, size: 36}]},
        {kind: 'photo', name: 'oise', x: 680, y: 510, w: 260, h: 230, delay: 66},
        {
          kind: 'text',
          x: 160,
          y: 700,
          delay: 72,
          mode: 'spread',
          lines: [
            {text: 'Réseau de chaleur', weight: 400, color: K.green, size: 34},
            {text: `≈ ${P.homesHeated.toLocaleString('fr-FR').replace(/ /g, ' ')} logements`, color: K.green, size: 48},
          ],
        },
      ]}
    />
    <CornerBadge />
  </White>
);

// 9 — Mots-clés sur photo plein écran.
export const SceneKeywords: React.FC = () => (
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
export const SceneTimeline: React.FC = () => (
  <White>
    <TextBlock
      lines={[
        {text: 'Un calendrier', weight: 400, size: 44},
        {text: 'maîtrisé', size: 70},
      ]}
      delay={0}
      style={{left: 200, top: 90}}
    />
    <Timeline milestones={P.milestones} y={680} delay={10} />
    <CornerBadge />
  </White>
);

// 11 — Chiffres clés : compteurs.
export const SceneFigures: React.FC = () => (
  <White>
    <FlowLine path="low" delay={0} draw={60} />
    <TextBlock
      lines={[{text: 'Un projet pour le territoire', size: 56}]}
      delay={0}
      align="center"
      style={{left: 0, width: 1920, top: 170}}
    />
    <Counters
      y={360}
      delay={12}
      items={[
        {value: P.jobs, label: 'emplois directs'},
        {value: P.homesHeated, label: 'logements chauffés'},
        {value: 100, suffix: ' %', label: 'électricité bas carbone'},
      ]}
    />
  </White>
);

// 12 — Message sur photo aérienne avec badge.
export const SceneMessage: React.FC = () => (
  <AbsoluteFill>
    <Photo name="dcroof" duration={150} zoom={[1.15, 1.02]} />
    <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent 60%)'}} />
    <Badge x={200} y={250} size={260} color={K.orange} delay={4} label={P.name} />
    <TextBlock
      lines={[
        {text: 'Un projet conçu', color: 'white', size: 50},
        {text: 'pour et avec', color: 'white', size: 50, weight: 300},
        {text: 'le territoire', color: 'white', size: 50},
      ]}
      delay={18}
      style={{left: 200, top: 560}}
    />
  </AbsoluteFill>
);

// 13 — Mots géants remplis par une photo.
export const SceneVerbs: React.FC = () => (
  <White>
    <PhotoText name="servers1" words={P.verbs} size={180} delay={4} stagger={14} duration={190} id="verbs" />
    <FlowLine path="sweep" delay={30} draw={70} />
  </White>
);

// 14 — Fin : question tapée, triangle qui fonce, logo final + crédits.
export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const endCard = frame >= 102;
  return (
    <White>
      {!endCard && (
        <>
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
        </>
      )}
      {endCard && (
        <>
          <SquareCluster x={600} y={520} squares={DEFAULT_CLUSTER} delay={104} scale={0.9} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <ProjectLogo name={P.name} size={110} delay={110} />
          </AbsoluteFill>
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              width: 1920,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 16,
              color: '#8a8a8a',
              opacity: frame > 130 ? 1 : 0,
            }}
          >
            Projet fictif · Photos : Wikimedia Commons (CC BY / CC BY-SA / CC0) — auteurs listés dans CREDITS.md
          </div>
        </>
      )}
    </White>
  );
};
