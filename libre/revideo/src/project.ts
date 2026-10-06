import {makeProject} from '@revideo/core';
import film from './film';

export default makeProject({
  scenes: [film],
  settings: {
    shared: {size: {x: 1920, y: 1080}, background: '#FFFFFF'},
    rendering: {fps: 30, exporter: {name: '@revideo/core/ffmpeg', options: {format: 'mp4'}}},
  },
});
