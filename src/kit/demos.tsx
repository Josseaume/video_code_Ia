import {AbsoluteFill} from 'remotion';
import {Collage, mosaicRow} from './Collage';
import {Counters} from './Counters';
import {DEFAULT_CLUSTER, ShapeBurst, SquareCluster} from './Confetti';
import {BlockWipe, ColorWash, TriangleZoom, TypeOn} from './Effects';
import {FlowLine} from './FlowLine';
import {KeywordsOverPhoto, PhotoOpener} from './FullPhoto';
import {Badge, ProjectLogo} from './Logo';
import {MapOise, MapRegion} from './MapRegion';
import {PhotoText} from './PhotoText';
import {StatCard} from './StatCard';
import {TextBlock} from './Text';
import {Timeline} from './Timeline';
import {K} from './theme';

// Une démo par brique du kit, visibles dans le dossier "Kit" du Studio.

const White: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'white', overflow: 'hidden'}}>{children}</AbsoluteFill>
);

const Confettis = () => (
  <White>
    <ShapeBurst />
    <SquareCluster x={960} y={540} squares={DEFAULT_CLUSTER} delay={25} scale={1.8} />
  </White>
);

const Logo = () => (
  <White>
    <SquareCluster x={480} y={540} squares={DEFAULT_CLUSTER} delay={0} />
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <ProjectLogo size={120} delay={10} />
    </AbsoluteFill>
    <Badge x={1650} y={860} size={140} delay={30} />
  </White>
);

const Lignes = () => (
  <White>
    <FlowLine path="high" delay={0} tailDelay={50} color={K.green} />
    <FlowLine path="sweep" delay={10} tailDelay={50} color={K.orange} />
    <FlowLine path="low" delay={20} tailDelay={50} color={K.teal} />
    <FlowLine path="diagonal" delay={30} tailDelay={50} color={K.burgundy} />
  </White>
);

const Titres = () => (
  <White>
    <TextBlock
      style={{left: 200, top: 250}}
      lines={[
        {text: 'Vous avez un projet', size: 64},
        {text: "d'achat, d'installation", weight: 400, size: 48},
        {text: "ou d'investissement ?", weight: 400, size: 48},
      ]}
    />
    <TextBlock
      style={{left: 200, top: 620}}
      mode="spread"
      delay={30}
      lines={[
        {text: 'Nous avons', color: K.lime, size: 64},
        {text: 'les solutions', color: K.lime, size: 64},
      ]}
    />
  </White>
);

const Mosaique = () => (
  <White>
    <Collage items={mosaicRow(['fields1', 'servers2', 'greenhouse', 'beauvais', 'oise'], {y: 340, w: 300, h: 400, stagger: 5})} />
    <FlowLine path="sweep" color="white" delay={20} />
  </White>
);

const Ouverture = () => (
  <PhotoOpener name="fields3" duration={150} words={[{text: 'Propriétaires'}, {text: 'Agriculteurs'}, {text: 'Collectivités'}, {text: '…', weight: 300}]} />
);

const ChiffreCle = () => (
  <White>
    <StatCard name="fields2" x={620} y={170} w={680} h={740} lines={[{text: 'Entre'}, {count: 1200, big: true}, {text: 'et'}, {count: 1400, big: true}, {text: 'opérations'}]} />
  </White>
);

const MotsCles = () => (
  <KeywordsOverPhoto
    name="beauvais"
    duration={150}
    groups={[
      {at: 5, lines: [{text: 'Expertise'}, {text: 'connaissance', weight: 300}, {text: 'du marché', weight: 300}]},
      {at: 75, lines: [{text: 'Évaluation', color: K.orange}, {text: 'au juste prix', color: K.orange}, {text: 'certification', weight: 300}]},
    ]}
  />
);

const TexteImage = () => (
  <White>
    <PhotoText name="greenhouse" words={['ACHETER', 'INSTALLER', 'DÉVELOPPER', 'TRANSMETTRE']} id="demo" />
  </White>
);

const Carte = () => (
  <White>
    <MapOise x={560} cities={[{name: 'Beauvais', lon: 2.08, lat: 49.43, main: true}, {name: 'Compiègne', lon: 2.83, lat: 49.42}]} site={{lon: 2.5, lat: 49.35, label: 'Ici'}} paris="50 KM" />
  </White>
);

const CarteBretagne = () => (
  <White>
    <MapRegion
      region="bretagne"
      x={880}
      y={250}
      scale={240}
      cities={[
        {name: 'Rennes', lon: -1.68, lat: 48.11, main: true},
        {name: 'Brest', lon: -4.49, lat: 48.39, main: true},
        {name: 'Quimper', lon: -4.1, lat: 48.0},
        {name: 'Lorient', lon: -3.37, lat: 47.75},
        {name: 'Vannes', lon: -2.76, lat: 47.66},
        {name: 'Saint-Brieuc', lon: -2.76, lat: 48.51},
      ]}
      site={{lon: -3.0, lat: 48.2, label: 'Le site'}}
      link={{lon: -1.68, lat: 48.11, label: ''}}
    />
  </White>
);

const Frise = () => (
  <White>
    <Timeline
      milestones={[
        {year: '2025', label: 'Étude', photo: 'fields4'},
        {year: '2026', label: 'Chantier', photo: 'crane'},
        {year: '2027', label: 'Ouverture', photo: 'servers2'},
      ]}
    />
  </White>
);

const Compteurs = () => (
  <White>
    <Counters items={[{value: 98, suffix: ' %', label: 'satisfaction'}, {value: 12500, label: 'hectares'}, {value: 42, label: 'conseillers'}]} />
  </White>
);

const Transitions = () => (
  <White>
    <TextBlock style={{left: 0, width: 1920, top: 480}} align="center" lines={[{text: 'Transitions', size: 90}]} />
    <ColorWash at={10} />
    <BlockWipe at={45} color={K.teal} />
    <BlockWipe at={70} color={K.orange} direction="left" />
    <TriangleZoom delay={95} />
  </White>
);

const Question = () => (
  <White>
    <SquareCluster x={330} y={500} squares={DEFAULT_CLUSTER.slice(0, 5)} />
    <TypeOn text="ET SI ON EN PARLAIT ?" x={420} y={450} size={80} delay={8} />
  </White>
);

export const KIT_DEMOS: {id: string; component: React.FC; duration: number}[] = [
  {id: 'Confettis', component: Confettis, duration: 90},
  {id: 'Logo', component: Logo, duration: 90},
  {id: 'Lignes', component: Lignes, duration: 120},
  {id: 'TitresDeuxTons', component: Titres, duration: 100},
  {id: 'Mosaique', component: Mosaique, duration: 110},
  {id: 'OuverturePhoto', component: Ouverture, duration: 120},
  {id: 'ChiffreCle', component: ChiffreCle, duration: 110},
  {id: 'MotsClesPhoto', component: MotsCles, duration: 150},
  {id: 'TexteImage', component: TexteImage, duration: 110},
  {id: 'Carte', component: Carte, duration: 150},
  {id: 'CarteBretagne', component: CarteBretagne, duration: 200},
  {id: 'Frise', component: Frise, duration: 120},
  {id: 'Compteurs', component: Compteurs, duration: 90},
  {id: 'Transitions', component: Transitions, duration: 130},
  {id: 'Question', component: Question, duration: 80},
];
