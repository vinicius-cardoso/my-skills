import React from 'react';
import {Composition} from 'remotion';
import {EscopoVideo, escopoDuration} from './escopo/Video';

// One <Composition> per video. The id must equal the video id (folder names in content/, public/, src/).
export const Root: React.FC = () => (
  <>
    <Composition id="escopo" component={EscopoVideo} durationInFrames={escopoDuration} fps={30} width={1920} height={1080} />
  </>
);
