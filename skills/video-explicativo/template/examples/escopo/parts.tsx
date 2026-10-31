import React from 'react';
import {C, Part as BasePart} from '../lib';

const PARTS: Record<number, {label: string; color: string}> = {
  1: {label: 'bloco', color: C.teal},
  2: {label: 'namespace nomeado', color: C.blue},
  3: {label: 'namespace primitivo', color: C.purple},
  4: {label: 'escopo dinâmico', color: C.orange},
};

export const Part: React.FC<{n: number; p?: number}> = ({n, p}) => <BasePart n={n} p={p} {...PARTS[n]} />;
