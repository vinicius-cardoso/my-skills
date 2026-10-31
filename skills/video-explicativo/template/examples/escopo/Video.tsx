import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, Scene, Watermark, Beat} from '../lib';
import timeline from '../../public/escopo/timeline.json';
import {Hook, Defs, Blocks, Nesting} from './scenes1';
import {Stack, Named} from './scenes2';
import {Primitive, Dynamic, Redef, Recap} from './scenes3';

const SCENES: Record<string, React.FC> = {
  hook: Hook, defs: Defs, blocks: Blocks, nesting: Nesting, stack: Stack,
  named: Named, primitive: Primitive, dynamic: Dynamic, redef: Redef, recap: Recap,
};

export const escopoDuration = timeline.dur;

export const EscopoVideo: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #0f1522 0%, ${C.bg} 70%)`}}>
    {timeline.scenes.map((s) => {
      const Comp = SCENES[s.id];
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          <Scene beats={s.beats as Beat[]} dur={s.dur}><Comp /></Scene>
        </Sequence>
      );
    })}
    <Watermark text="DCC024 · escopo" />
  </AbsoluteFill>
);
