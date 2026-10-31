import React, {createContext, useContext} from 'react';
import {
  AbsoluteFill, Audio, Easing, Sequence, interpolate, interpolateColors, staticFile,
  useCurrentFrame,
} from 'remotion';
import {loadFont as loadHand} from '@remotion/google-fonts/PatrickHand';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

export const HAND = loadHand('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['400', '700'], subsets: ['latin', 'latin-ext']}).fontFamily;

export const C = {
  bg: '#0b0f17', panel: '#0f1520', panel2: '#151c29', border: '#253044',
  text: '#e6edf3', soft: '#b7c0cc', muted: '#7d8794', dim: '#454f5e',
  teal: '#5eead4', green: '#4ade80', yellow: '#fbbf24', red: '#f87171',
  blue: '#60a5fa', purple: '#c084fc', orange: '#fb923c', pink: '#f472b6',
};

export const al = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// ---------------------------------------------------------------- timing

export type Beat = {from: number; dur: number; audio: string; text: string};
const BeatCtx = createContext<{beats: Beat[]; dur: number}>({beats: [], dur: 0});

const EASE = Easing.out(Easing.cubic);
export const ramp = (frame: number, start: number, d = 14, easing = EASE) =>
  interpolate(frame, [start, start + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const useBeats = () => {
  const {beats, dur} = useContext(BeatCtx);
  const frame = useCurrentFrame();
  /** frame at fraction f of beat i's narration */
  const t = (i: number, f = 0) => Math.round(beats[i].from + f * beats[i].dur);
  const end = (i: number) => beats[i].from + beats[i].dur;
  const inn = (i: number, f = 0, d = 14) => ramp(frame, t(i, f), d);
  const pop = (i: number, f = 0, d = 16) => ramp(frame, t(i, f), d, Easing.out(Easing.back(1.6)));
  const out = (i: number, f = 0, d = 12) => 1 - ramp(frame, t(i, f), d);
  const on = (i: number, f = 0) => frame >= t(i, f);
  /** fraction of beat i at which `word` (k-th occurrence) is spoken, estimated from character position */
  const w = (i: number, word: string, k = 0) => {
    const tx = beats[i].text;
    let idx = -1;
    for (let n = 0; n <= k; n++) {
      idx = tx.indexOf(word, idx + 1);
      if (idx < 0) throw new Error(`"${word}" not in beat ${i}: ${tx}`);
    }
    return idx / tx.length;
  };
  return {frame, beats, dur, t, end, inn, pop, out, on, w};
};

export const Scene: React.FC<{beats: Beat[]; dur: number; children: React.ReactNode}> = ({beats, dur, children}) => {
  const frame = useCurrentFrame();
  const op = Math.min(ramp(frame, 0, 10), 1 - ramp(frame, dur - 12, 12));
  return (
    <BeatCtx.Provider value={{beats, dur}}>
      {beats.map((b, i) => (
        <Sequence key={i} from={b.from} durationInFrames={b.dur + 2}>
          <Audio src={staticFile(b.audio)} />
        </Sequence>
      ))}
      <AbsoluteFill style={{opacity: op}}>{children}</AbsoluteFill>
    </BeatCtx.Provider>
  );
};

// ---------------------------------------------------------------- primitives

type Pos = {x: number; y: number};
type Anchor = 'tl' | 'c' | 'tc';

/** absolutely positioned, appears with opacity + slide */
export const Box: React.FC<Pos & {
  p?: number; a?: Anchor; style?: React.CSSProperties; children?: React.ReactNode; dy?: number; scale?: number;
}> = ({x, y, p = 1, a = 'tl', style, children, dy = 14, scale = 1}) => {
  if (p <= 0.001) return null;
  const tx = a === 'tl' ? '0' : '-50%';
  const ty = a === 'c' ? '-50%' : '0';
  return (
    <div style={{
      position: 'absolute', left: x, top: y, opacity: Math.min(1, p),
      transform: `translate(${tx}, ${ty}) translateY(${(1 - p) * dy}px) scale(${scale * (0.97 + 0.03 * p)})`,
      transformOrigin: 'center', ...style,
    }}>{children}</div>
  );
};

export const Hand: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> =
  ({size = 40, color = C.text, children, style}) => (
    <div style={{fontFamily: HAND, fontSize: size, color, lineHeight: 1.25, whiteSpace: 'pre', ...style}}>{children}</div>
  );

/** typewriter text */
export const Type: React.FC<{text: string; p: number; size?: number; color?: string; caret?: boolean}> =
  ({text, p, size = 56, color = C.teal, caret = true}) => {
    const frame = useCurrentFrame();
    const n = Math.floor(text.length * Math.min(1, p));
    const blink = caret && p < 1 && Math.floor(frame / 6) % 2 === 0;
    return (
      <Hand size={size} color={color}>
        {text.slice(0, n)}
        <span style={{opacity: blink ? 0.8 : 0, color: C.yellow}}>|</span>
      </Hand>
    );
  };

export const Chip: React.FC<{
  children: React.ReactNode; color?: string; size?: number; mono?: boolean; fill?: number; style?: React.CSSProperties;
}> = ({children, color = C.teal, size = 30, mono = false, fill = 0.12, style}) => (
  <div style={{
    display: 'inline-block', padding: `${size * 0.18}px ${size * 0.45}px`, borderRadius: size * 0.28,
    border: `2px solid ${al(color, 0.55)}`, background: al(color, fill), color,
    fontFamily: mono ? MONO : HAND, fontSize: size, lineHeight: 1.2, whiteSpace: 'pre', ...style,
  }}>{children}</div>
);

export const Card: React.FC<{
  w?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; pad?: number;
}> = ({w, color = C.border, children, style, pad = 26}) => (
  <div style={{
    width: w, padding: pad, borderRadius: 16, border: `2px solid ${color === C.border ? C.border : al(color, 0.5)}`,
    background: color === C.border ? C.panel : al(color, 0.07), ...style,
  }}>{children}</div>
);

/** small section title at the top centre, typed like Bytada's */
export const Title: React.FC<{text: string; p: number; color?: string; y?: number; size?: number}> =
  ({text, p, color = C.teal, y = 52, size = 54}) => (
    <Box x={960} y={y} a="tc" p={Math.min(1, p * 4)} dy={0}>
      <Type text={text} p={p} size={size} color={color} />
    </Box>
  );

/** chapter chip at the top-left, e.g. "1 · bloco" */
export const Part: React.FC<{n: number; label: string; color: string; p?: number}> = ({n, label, color, p = 1}) => (
  <Box x={56} y={50} p={p}>
    <Chip color={color} size={24}>{`${n} · ${label}`}</Chip>
  </Box>
);

export const Watermark: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', right: 48, bottom: 30, fontFamily: HAND, fontSize: 22, color: C.dim}}>{text}</div>
);

// ---------------------------------------------------------------- code panels

type Seg = {text: string; id?: string; col: number};
export type Hl = {c: string; a: number; def?: boolean; dashed?: boolean};

const parse = (code: string): Seg[][] =>
  code.replace(/^\n/, '').split('\n').map((line) => {
    const segs: Seg[] = [];
    let col = 0;
    const re = /\[\[([\w-]+)\|([^\]]*)\]\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m.index > last) { segs.push({text: line.slice(last, m.index), col}); col += m.index - last; }
      segs.push({text: m[2], id: m[1], col});
      col += m[2].length;
      last = re.lastIndex;
    }
    if (last < line.length) segs.push({text: line.slice(last), col});
    return segs;
  });

export const geom = (code: string, s: number, minCols = 0, lhMul = 1.62) => {
  const lines = parse(code);
  const cw = s * 0.6;
  const lh = Math.round(s * lhMul);
  const px = s * 0.95;
  const py = s * 0.7;
  const cols = Math.max(minCols, ...lines.map((l) => l.reduce((n, g) => n + g.text.length, 0)));
  const pos = (id: string) => {
    for (let i = 0; i < lines.length; i++)
      for (const g of lines[i]) if (g.id === id)
        return {x: px + g.col * cw, y: py + i * lh, w: g.text.length * cw, h: lh, line: i};
    throw new Error(`token ${id} not found`);
  };
  /** rectangle covering lines [l0,l1] and columns [c0,c1) */
  const rect = (l0: number, l1: number, c0 = 0, c1 = cols) =>
    ({x: px + c0 * cw, y: py + l0 * lh, w: (c1 - c0) * cw, h: (l1 - l0 + 1) * lh});
  return {lines, cw, lh, px, py, cols, w: px * 2 + cols * cw, h: py * 2 + lines.length * lh, pos, rect};
};

const KW = new Set(('fun val let in end struct structure case of fn if then else class public private static ' +
  'void int real return for while break new true false include main printf').split(' '));
const tokColor = (tok: string) => {
  if (/^"/.test(tok)) return '#d8b48a';
  if (/^\(\*|^\/\//.test(tok)) return '#5c6878';
  if (/^\d/.test(tok)) return '#e7a774';
  if (KW.has(tok)) return '#8f9ccf';
  if (/^\w/.test(tok)) return '#d6dde6';
  return '#8b949e';
};
const lex = (s: string) => s.match(/"[^"]*"|\(\*.*?\*\)|\/\/.*$|\d+(?:\.\d+)?|[A-Za-z_#]\w*|\s+|./g) ?? [];

export const Code: React.FC<{
  code: string; x: number; y: number; s?: number; p?: number; hl?: Record<string, Hl>; dim?: number;
  lineOp?: (i: number) => number; tab?: string; minCols?: number; cursor?: {line: number; a: number; n?: number};
  children?: React.ReactNode; badgeDefs?: boolean; lhMul?: number;
}> = ({code, x, y, s = 30, p = 1, hl = {}, dim = 0, lineOp, tab, minCols = 0, cursor, children, badgeDefs = false, lhMul = 1.62}) => {
  const g = geom(code, s, minCols, lhMul);
  if (p <= 0.001) return null;
  return (
    <Box x={x} y={y} p={p}>
      <div style={{
        position: 'relative', width: g.w, height: g.h, borderRadius: 14,
        background: C.panel, border: `2px solid ${C.border}`,
      }}>
        {tab && (
          <div style={{position: 'absolute', right: 14, top: -16, fontFamily: HAND, fontSize: 24, color: C.muted,
            background: C.bg, padding: '0 8px'}}>{tab}</div>
        )}
        {cursor && cursor.a > 0 && (
          <div style={{position: 'absolute', left: 6, right: 6, top: g.py + cursor.line * g.lh, height: g.lh * (cursor.n ?? 1),
            background: al(C.blue, 0.09 * cursor.a), borderLeft: `4px solid ${al(C.blue, 0.8 * cursor.a)}`, borderRadius: 4}} />
        )}
        {/* highlight boxes */}
        {g.lines.flatMap((line) => line.filter((sg) => sg.id && hl[sg.id]?.a > 0).map((sg) => {
          const h = hl[sg.id!];
          const r = g.pos(sg.id!);
          return (
            <div key={sg.id} style={{
              position: 'absolute', left: r.x - 5, top: r.y + r.h * 0.08, width: r.w + 10, height: r.h * 0.84,
              borderRadius: 7, background: al(h.c, (h.def ? 0.3 : 0.12) * h.a),
              border: `2px ${h.dashed ? 'dashed' : 'solid'} ${al(h.c, 0.85 * h.a)}`,
            }} />
          );
        }))}
        {g.lines.map((line, i) => (
          <div key={i} style={{
            position: 'absolute', left: g.px, top: g.py + i * g.lh, height: g.lh, lineHeight: `${g.lh}px`,
            fontFamily: MONO, fontSize: s, whiteSpace: 'pre', fontVariantLigatures: 'none',
            opacity: lineOp ? lineOp(i) : 1,
          }}>
            {line.map((sg, k) => {
              if (sg.id) {
                const h = hl[sg.id];
                const a = h?.a ?? 0;
                return (
                  <span key={k} style={{
                    color: h ? interpolateColors(a, [0, 1], [C.text, h.c]) : C.text,
                    opacity: 1 - 0.6 * dim * (1 - a), fontWeight: h?.def && a > 0.5 ? 700 : 400,
                  }}>{sg.text}</span>
                );
              }
              return lex(sg.text).map((tok, j) => (
                <span key={`${k}-${j}`} style={{color: tokColor(tok), opacity: 1 - 0.6 * dim}}>{tok}</span>
              ));
            })}
          </div>
        ))}
        {badgeDefs && g.lines.flatMap((line) => line.filter((sg) => sg.id && hl[sg.id]?.def && hl[sg.id].a > 0).map((sg) => {
          const h = hl[sg.id!];
          const r = g.pos(sg.id!);
          return (
            <div key={`b-${sg.id}`} style={{
              position: 'absolute', left: r.x + r.w / 2, top: r.y + r.h * 0.08 - 3, transform: 'translate(-50%,-50%)',
              fontFamily: MONO, fontSize: s * 0.42, fontWeight: 700, color: C.bg, background: h.c,
              padding: '1px 6px', borderRadius: 5, opacity: h.a,
            }}>DEF</div>
          );
        }))}
        <div style={{position: 'absolute', inset: 0}}>{children}</div>
      </div>
    </Box>
  );
};

// ---------------------------------------------------------------- arrows / overlays

export const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; p: number; color?: string; bend?: number; w?: number; dashed?: boolean;
}> = ({x1, y1, x2, y2, p, color = C.yellow, bend = -60, w = 3, dashed}) => {
  if (p <= 0) return null;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bend;
  const cy = my + (dx / len) * bend;
  // tangent at the end
  const tx = x2 - cx;
  const ty = y2 - cy;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const hs = 13;
  const head = `${x2},${y2} ${x2 - ux * hs - uy * hs * 0.6},${y2 - uy * hs + ux * hs * 0.6} ${x2 - ux * hs + uy * hs * 0.6},${y2 - uy * hs - ux * hs * 0.6}`;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1} height={1}>
      <path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={w}
        strokeLinecap="round" pathLength={1} strokeDasharray={dashed ? undefined : '1 1'}
        strokeDashoffset={dashed ? undefined : 1 - Math.min(1, p)} style={dashed ? {strokeDasharray: '8 8', opacity: p} : undefined} />
      <polygon points={head} fill={color} opacity={p > 0.92 ? 1 : 0} />
    </svg>
  );
};

/** dashed region over code (coordinates from geom().rect) */
export const Region: React.FC<{
  r: {x: number; y: number; w: number; h: number}; color: string; p: number; label?: string; fill?: number; pad?: number;
  labelSide?: 'right' | 'top-right' | 'left';
}> = ({r, color, p, label, fill = 0.06, pad = 8, labelSide = 'top-right'}) => {
  if (p <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: r.x - pad, top: r.y - pad / 2, width: r.w + pad * 2, height: r.h + pad,
      border: `2px dashed ${al(color, 0.8)}`, background: al(color, fill), borderRadius: 10, opacity: p,
    }}>
      {label && (
        <div style={{
          position: 'absolute', fontFamily: HAND, fontSize: 30, color, whiteSpace: 'pre',
          ...(labelSide === 'top-right' ? {right: 10, top: -42} : labelSide === 'right' ? {left: '100%', top: 6, marginLeft: 14} : {right: '100%', top: 6, marginRight: 14}),
        }}>{label}</div>
      )}
    </div>
  );
};

/** small label anchored under/over a token, inside a Code overlay */
export const TokLabel: React.FC<{
  at: {x: number; y: number; w: number; h: number}; text: string; color: string; p: number; above?: boolean; size?: number;
}> = ({at, text, color, p, above, size = 28}) => {
  if (p <= 0) return null;
  return (
    <div style={{
      position: 'absolute', left: at.x + at.w / 2, top: above ? at.y - 6 : at.y + at.h + 4,
      transform: `translate(-50%, ${above ? '-100%' : '0'}) translateY(${(1 - p) * (above ? 8 : -8)}px)`,
      fontFamily: HAND, fontSize: size, color, opacity: p, whiteSpace: 'pre', textAlign: 'center',
    }}>{text}</div>
  );
};

export const Terminal: React.FC<{lines: {t: string; c?: string}[]; s?: number; w?: number; title?: string}> =
  ({lines, s = 26, w, title}) => (
    <div style={{width: w, background: '#0a0d13', border: `2px solid ${C.border}`, borderRadius: 12, padding: '14px 22px'}}>
      {title && <div style={{fontFamily: HAND, fontSize: 20, color: C.muted, marginBottom: 6}}>{title}</div>}
      {lines.map((l, i) => (
        <div key={i} style={{fontFamily: MONO, fontSize: s, color: l.c ?? C.soft, whiteSpace: 'pre', lineHeight: 1.5}}>{l.t}</div>
      ))}
    </div>
  );
