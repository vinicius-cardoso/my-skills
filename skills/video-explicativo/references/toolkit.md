# Toolkit: `studio/src/lib.tsx`

Canvas is 1920×1080 at 30 fps. Everything is absolutely positioned in pixels. Scenes are React components
rendered inside `<Scene>` (done by `Video.tsx`), which plays each beat's mp3 and fades the scene in/out.

## Timing: `useBeats()`

```tsx
const {frame, t, end, inn, pop, out, on, w} = useBeats();
```

| Call | Meaning |
| --- | --- |
| `t(i, f)` | frame at fraction `f` (0–1) of beat `i`'s narration |
| `w(i, 'palavra', k?)` | fraction of beat `i` where the k-th occurrence of `palavra` is spoken (estimated from character position; throws if absent) |
| `inn(i, f, d=14)` | 0→1 ease-out starting at `t(i,f)` over `d` frames: use as opacity/progress |
| `pop(i, f)` | like `inn` with a small overshoot |
| `out(i, f, d=12)` | 1→0: multiply a group's opacity by it to clear the stage for the next idea |
| `end(i)` | frame where beat `i`'s audio ends (countdowns during a `pause`) |
| `ramp(frame, start, d)` | raw 0→1 helper |

Idioms:
```tsx
const show = inn(3, w(3, 'Resultado'));                       // appears on the word "Resultado"
<div style={{opacity: out(5, 0)}}>…everything of part A…</div>  // part A leaves when beat 5 starts
const hl = {x: {c: C.teal, a: inn(1, 0.2), def: true}};        // token highlight fading in
```

## Components

| Component | Use |
| --- | --- |
| `<Title text p color?>` | small typed title at top-centre (`p` = typing progress, e.g. `ramp(frame, t(0), 24)`) |
| `<Part n label color p?>` | chapter chip at top-left (wrap it per video with the topic's taxonomy, see `escopo/parts.tsx`) |
| `<Box x y a="tl"\|"c"\|"tc" p>` | positioned wrapper that fades/slides in with `p`; `a="tc"` centres horizontally on `x` |
| `<Hand size color>` | hand-written text (Patrick Hand) |
| `<Type text p size color>` | typewriter text with caret while typing |
| `<Chip color size mono?>` | rounded tinted label: keywords, results, legends |
| `<Card w color pad>` | tinted bordered panel for definitions, rules, summaries |
| `<Terminal lines s w>` | compiler/REPL output (`lines: {t, c?}[]`) |
| `<Code code x y s hl dim lineOp cursor tab badgeDefs lhMul>` | code panel, see below |
| `<Arrow x1 y1 x2 y2 p color bend w>` | curved arrow drawn progressively (`p` 0→1); positive/negative `bend` flips the side |
| `<Region r color p label labelSide fill>` | dashed box over code lines (a block, a scope) |
| `<TokLabel at text color p above?>` | small caption under/over a token |
| `<Watermark text>` | bottom-right signature, set once in `Video.tsx` |

Colors: `C.teal C.yellow C.purple C.blue C.orange C.red C.green C.pink` + `C.text C.soft C.muted C.dim`;
`al(hex, alpha)` gives rgba.

## Code panels

Mark tokens you want to point at with `[[id|text]]`:

```tsx
const code = `
fun [[f|f]] [[y|y]] = [[yu|y]] + [[incu|inc]]`;
const g = geom(code, 30);          // same s (and lhMul) as the <Code>!
const p = g.pos('incu');           // {x, y, w, h, line} relative to the panel's top-left
<Code code={code} x={110} y={190} s={30} hl={{incu: {c: C.yellow, a: 1}}}>
  {/* children share the panel's coordinate system */}
  <Arrow x1={p.x + p.w / 2} y1={p.y} x2={…} y2={…} p={inn(2, 0.1, 18)} />
  <Region r={g.rect(1, 3)} color={C.teal} p={…} label="bloco" />
</Code>
```

- `hl[id] = {c, a, def?, dashed?}`: `def` = solid strong fill (a definition), `dashed` = a use.
- `badgeDefs` draws a "DEF" tag above definitions. In dense code pass `lhMul={1.95}` (and the same to
  `geom`) so tags don't cover the line above.
- `cursor={{line, n, a}}` draws the "the compiler/interpreter is here" bar; interpolate `line` between
  beats for a moving cursor (see `escopo/scenes2.tsx`).
- `lineOp={(i) => …}` reveals lines one at a time; `dim` fades unhighlighted tokens.
- Syntax colors are deliberately muted so highlight colors carry the meaning.
- Character width is exactly `0.6 × s` (JetBrains Mono, ligatures off), which is what makes `pos()`
  pixel-accurate. Don't use tabs in code strings.

## Simulations

For a mechanism that changes state (dictionary stack, call stack, heap, trace table), don't hand-animate
each frame. Write an **event list** with frames taken from the narration (`t(i, w(i, 'pop'))`), replay
all events once to compute each element's start/end frames, then render from `frame`. `escopo/scenes2.tsx`
(`Stack`) does this for push/addDefinition/lookup/pop, including a lookup that scans the stack top-down,
red on a miss and green on the hit. Keep each transient indicator visible until the next event (not a fixed
number of frames), or it vanishes before the viewer reads it.
