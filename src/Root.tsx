import {Composition, Folder} from 'remotion';
import {DatacenterOise, DC_DURATION, DC_SCENES} from './datacenter/DatacenterOise';
import {KIT_DEMOS} from './kit/demos';
import {Showreel, SHOWREEL_DURATION} from './Showreel';

const HD = {fps: 30, width: 1920, height: 1080} as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Showreel" component={Showreel} durationInFrames={SHOWREEL_DURATION} {...HD} />
    <Composition id="DatacenterOise" component={DatacenterOise} durationInFrames={DC_DURATION} {...HD} />
    <Folder name="Kit">
      {KIT_DEMOS.map((demo) => (
        <Composition key={demo.id} id={`Kit-${demo.id}`} component={demo.component} durationInFrames={demo.duration} {...HD} />
      ))}
    </Folder>
    <Folder name="Scenes-DataCenter">
      {DC_SCENES.map((scene) => (
        <Composition key={scene.id} id={`DC-${scene.id}`} component={scene.component} durationInFrames={scene.duration} {...HD} />
      ))}
    </Folder>
  </>
);
