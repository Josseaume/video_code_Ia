import {makeProject} from '@revideo/core';
import datacenter from './scenes/datacenter';

export default makeProject({
  scenes: [datacenter],
  settings: {
    shared: {size: {x: 1920, y: 1080}, background: '#000000'},
    rendering: {fps: 60, exporter: {name: '@revideo/core/ffmpeg', options: {format: 'mp4'}}},
  },
});
