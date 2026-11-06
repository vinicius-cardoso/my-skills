import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {EscopoVideo, escopoDuration} from './Video';

registerRoot(() => (
  <Composition id="escopo" component={EscopoVideo} durationInFrames={escopoDuration} fps={30} width={1920} height={1080} />
));
