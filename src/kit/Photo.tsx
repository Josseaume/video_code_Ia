import type {CSSProperties} from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const photo = (name: string) => staticFile(`photos/${name}.jpg`);

// Photo plein cadre avec un lent zoom (effet "Ken Burns").
export const Photo: React.FC<{
  name: string;
  zoom?: [number, number];
  duration?: number;
  focus?: string;
  style?: CSSProperties;
}> = ({name, zoom = [1.04, 1.14], duration = 180, focus = 'center', style}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, duration], zoom);
  return (
    <Img
      src={photo(name)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: focus,
        transform: `scale(${scale})`,
        ...style,
      }}
    />
  );
};
