import React from 'react';
import {interpolate} from 'remotion';
import {
  Arrow, Box, C, Card, Chip, Code, Hand, MONO, Region, Title, TokLabel, al, geom, ramp, useBeats,
} from '../lib';
import {Part} from './parts';

export const GFH = `
fun [[g|g]] [[x|x]] =
  let
    val [[inc1|inc]] = 1
    fun [[f|f]] [[y|y]] = [[yu|y]] + [[incu|inc]]
    fun [[h|h]] [[z|z]] =
      let
        val [[inc2|inc]] = 2
      in
        [[fu|f]] [[zu|z]]
      end
  in
    [[hu|h]] [[xu|x]]
  end;`;

type Ev =
  | {f: number; k: 'push'; label: string}
  | {f: number; k: 'add'; name: string}
  | {f: number; k: 'pop'}
  | {f: number; k: 'look'; name: string; tok: string};

type Dict = {label: string; tPush: number; tPop?: number; depth: number; entries: {name: string; t: number}[]};

const STEP = 9;

// ============================================================ 5. pilha de dicionários
export const Stack = () => {
  const {inn, out, frame, t, w} = useBeats();
  const ops = [
    {name: 'push', c: C.teal, d: 'entrou num bloco →\nempilha um dicionário vazio', b: 1},
    {name: 'addDefinition', c: C.blue, d: 'achou uma definição →\nanota no dicionário do topo', b: 2},
    {name: 'lookup', c: C.yellow, d: 'achou um nome →\nprocura do topo pra baixo', b: 3},
    {name: 'pop', c: C.red, d: 'saiu do bloco →\njoga o dicionário fora', b: 4},
  ];
  const opsFade = out(5, 0, 14);

  const ev: Ev[] = [
    {f: t(5, w(5, 'dicionário global')), k: 'push', label: 'global'},
    {f: t(6, w(6, 'O g vai')), k: 'add', name: 'g'},
    {f: t(6, w(6, 'abre um bloco')), k: 'push', label: 'corpo de g'},
    {f: t(6, w(6, 'parâmetro x')), k: 'add', name: 'x'},
    {f: t(7, w(7, 'bloco novo')), k: 'push', label: 'let de g'},
    {f: t(7, w(7, 'val inc')), k: 'add', name: 'inc = 1'},
    {f: t(8, w(8, 'O f entra')), k: 'add', name: 'f'},
    {f: t(8, w(8, 'abre o bloco')), k: 'push', label: 'corpo de f'},
    {f: t(8, w(8, 'do y')), k: 'add', name: 'y'},
    {f: t(9, w(9, 'Lookup de y')), k: 'look', name: 'y', tok: 'yu'},
    {f: t(9, w(9, 'Lookup de inc')), k: 'look', name: 'inc', tok: 'incu'},
    {f: t(10, w(10, 'pop')), k: 'pop'},
    {f: t(11, w(11, 'O h entra')), k: 'add', name: 'h'},
    {f: t(11, w(11, 'abre o bloco')), k: 'push', label: 'corpo de h'},
    {f: t(11, w(11, 'do z')), k: 'add', name: 'z'},
    {f: t(11, w(11, 'let interno')), k: 'push', label: 'let de h'},
    {f: t(11, w(11, 'inc igual a 2')), k: 'add', name: 'inc = 2'},
    {f: t(12, w(12, 'Lookup de f')), k: 'look', name: 'f', tok: 'fu'},
    {f: t(13, w(13, 'dois pops')), k: 'pop'},
    {f: t(13, w(13, 'dois pops') + 0.05), k: 'pop'},
    {f: t(13, w(13, 'h x')), k: 'look', name: 'h', tok: 'hu'},
    {f: t(13, w(13, 'pops finais')), k: 'pop'},
    {f: t(13, w(13, 'pops finais') + 0.06), k: 'pop'},
  ];

  // replay all events (future ones too) to know push/pop times and depths
  const dicts: Dict[] = [];
  const looks: {f: number; name: string; tok: string; scan: number[]; hit: number}[] = [];
  const live = () => dicts.filter((d) => d.tPop === undefined);
  for (const e of ev) {
    if (e.k === 'push') dicts.push({label: e.label, tPush: e.f, depth: live().length, entries: []});
    else if (e.k === 'add') live().at(-1)!.entries.push({name: e.name, t: e.f});
    else if (e.k === 'pop') live().at(-1)!.tPop = e.f;
    else {
      const l = live();
      const scan: number[] = [];
      let hit = -1;
      for (let i = l.length - 1; i >= 0; i--) {
        scan.push(dicts.indexOf(l[i]));
        if (l[i].entries.some((en) => en.name.split(' ')[0] === e.name)) { hit = dicts.indexOf(l[i]); break; }
      }
      looks.push({f: e.f, name: e.name, tok: e.tok, scan, hit});
    }
  }
  const evAfter = (f0: number) => ev.map((e) => e.f).filter((f) => f > f0).sort((a, b) => a - b)[0] ?? Infinity;
  const curLook = looks.find((l) => frame >= l.f && frame < Math.min(evAfter(l.f) - 2, l.f + STEP * l.scan.length + 90));

  const s = 30;
  const g = geom(GFH, s);
  const codeX = 110;
  const codeY = 190;
  // cursor: [frame, line, n]
  const cur: [number, number, number][] = [
    [t(6, 0), 0, 1], [t(7, 0), 1, 2], [t(8, 0), 3, 1], [t(11, 0), 4, 3], [t(12, 0), 8, 1],
    [t(13, 0), 9, 1], [t(13, w(13, 'h x')), 11, 1], [t(13, w(13, 'pops finais')), 12, 1],
  ];
  let ci = -1;
  cur.forEach((c, i) => { if (frame >= c[0]) ci = i; });
  let cursor;
  if (ci >= 0) {
    const [f0, l0, n0] = cur[ci];
    const prev = ci > 0 ? cur[ci - 1] : cur[ci];
    const k = ramp(frame, f0, 10);
    cursor = {
      line: interpolate(k, [0, 1], [prev[1], l0]), n: interpolate(k, [0, 1], [prev[2], n0]),
      a: inn(6, 0) * out(14, 0, 10),
    };
  }
  const lookTok = curLook ? curLook.tok : '';
  const hl: Record<string, {c: string; a: number; def?: boolean; dashed?: boolean}> = {};
  if (lookTok) hl[lookTok] = {c: C.yellow, a: 1};
  const finale = inn(14, 0.05);
  const fin2 = inn(14, w(14, 'nem existia'));
  if (finale > 0) {
    hl.incu = {c: C.yellow, a: finale};
    hl.inc1 = {c: C.teal, a: finale, def: true};
    hl.inc2 = {c: C.red, a: fin2, dashed: true};
  }
  const pu = g.pos('incu');
  const p1 = g.pos('inc1');
  const p2 = g.pos('inc2');

  // stack geometry
  const SX = 780;
  const SW = 960;
  const DH = 92;
  const GAP = 14;
  const bottom = 960;
  const yOf = (depth: number) => bottom - (depth + 1) * DH - depth * GAP;

  return (
    <>
      <Part n={1} />
      <Title text="pilha de dicionários" p={ramp(frame, t(0, w(0, 'pilha')), 24)} />
      <div style={{opacity: opsFade, position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26}}>
        {ops.map((o) => {
          const p = inn(o.b, 0);
          return (
            <div key={o.name} style={{opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
              <Card w={400} color={o.c} pad={26}>
                <Chip color={o.c} size={30} mono>{o.name}</Chip>
                <Hand size={30} color={C.soft} style={{marginTop: 18}}>{o.d}</Hand>
              </Card>
            </div>
          );
        })}
      </div>
      <Box x={960} y={720} a="tc" p={inn(4, 0.5) * opsFade}>
        <Hand size={34} color={C.muted}>é assim que o compilador implementa escopo de bloco</Hand>
      </Box>

      <Code code={GFH} s={s} x={codeX} y={codeY} p={inn(5, 0.05)} hl={hl} cursor={cursor} tab="Lista 10 · ML" badgeDefs>
        <Arrow x1={pu.x + pu.w / 2} y1={pu.y + pu.h * 0.1} x2={p1.x + p1.w + 4} y2={p1.y + p1.h * 0.85} p={inn(14, 0.1, 18)} color={C.teal} bend={14} />
        <TokLabel at={p2} text="ainda nem existia" color={C.red} p={fin2} above={false} />
      </Code>

      {/* stack */}
      <Box x={SX} y={bottom + 18} p={inn(5, 0.3)}>
        <div style={{width: SW, height: 3, background: C.border, borderRadius: 2}} />
      </Box>
      {dicts.map((d, i) => {
        if (frame < d.tPush) return null;
        const pin = ramp(frame, d.tPush, 12);
        const pout = d.tPop !== undefined ? ramp(frame, d.tPop, 12) : 0;
        if (pout >= 1) return null;
        const y = yOf(d.depth) - (1 - pin) * 60;
        let border = C.border;
        let bg = C.panel;
        if (curLook) {
          const k = curLook.scan.indexOf(i);
          const step = Math.floor((frame - curLook.f) / STEP);
          if (k >= 0 && i === curLook.hit && step >= k) { border = C.green; bg = al(C.green, 0.08); }
          else if (k >= 0 && step === k) { border = C.red; bg = al(C.red, 0.08); }
        }
        return (
          <div key={i} style={{
            position: 'absolute', left: SX + pout * 120, top: y, width: SW, height: DH, opacity: pin * (1 - pout),
            borderRadius: 12, border: `2px solid ${border}`, background: bg, display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px',
          }}>
            <div style={{fontFamily: 'inherit', width: 190}}>
              <Hand size={30} color={C.muted}>{d.label}</Hand>
            </div>
            {d.entries.filter((en) => frame >= en.t).map((en) => {
              const pe = ramp(frame, en.t, 10);
              const isHit = curLook && curLook.hit === i && en.name.split(' ')[0] === curLook.name &&
                frame >= curLook.f + STEP * curLook.scan.indexOf(i);
              const col = isHit ? C.green : C.blue;
              return (
                <div key={en.name} style={{opacity: pe, transform: `scale(${0.8 + 0.2 * pe})`}}>
                  <Chip color={col} size={28} mono fill={isHit ? 0.25 : 0.1}>{en.name}</Chip>
                </div>
              );
            })}
          </div>
        );
      })}
      {curLook && (
        <Box x={SX + SW / 2} y={190} a="tc" p={ramp(frame, curLook.f, 8)} dy={6}>
          <Chip color={C.yellow} size={34} mono>{`lookup(${curLook.name})`}</Chip>
          {frame >= curLook.f + STEP * curLook.scan.length && (
            <Hand size={30} color={C.green} style={{marginTop: 10, textAlign: 'center'}}>
              {`achou ${curLook.scan.length === 1 ? 'no topo' : `${curLook.scan.length - 1} nível${curLook.scan.length > 2 ? 'is' : ''} abaixo`} ✓`}
            </Hand>
          )}
        </Box>
      )}
      {/* legend of ops, small, while simulating */}
      <Box x={SX} y={120} p={inn(5, 0.6) * out(14, 0)}>
        <div style={{display: 'flex', gap: 12}}>
          {ops.map((o) => <Chip key={o.name} color={o.c} size={20} mono>{o.name}</Chip>)}
        </div>
      </Box>
      <Box x={SX} y={360} p={inn(14, w(14, 'Naquele momento'))}>
        <Card w={SW} color={C.yellow} pad={28}>
          <Hand size={34} color={C.text} style={{whiteSpace: 'normal'}}>
            O <span style={{color: C.yellow}}>lookup(inc)</span> de f acontece quando o compilador <b>lê</b> f.
          </Hand>
          <Hand size={34} color={C.text} style={{marginTop: 10, whiteSpace: 'normal'}}>
            Só o <span style={{color: C.teal}}>inc = 1</span> estava na pilha.
          </Hand>
          <Hand size={30} color={C.muted} style={{marginTop: 14}}>guarda isso → escopo estático</Hand>
        </Card>
      </Box>
    </>
  );
};

// ============================================================ 6. namespace nomeado
export const Named = () => {
  const {inn, out, frame, t, w} = useBeats();
  const ml = `
structure [[S|S]] = struct
  val [[a|a]] = 1
  fun [[f|f]] x = x + [[au|a]]
end;

[[S2|S]].[[a2|a]];      (* 1 *)
[[S3|S]].[[f2|f]](5);   (* 6 *)`;
  const s = 30;
  const gm = geom(ml, s);
  const inside = inn(1, w(1, 'Dentro de S'));
  const sa = inn(1, w(1, 'S ponto a'));
  const sf = inn(1, w(1, 'S ponto f'));
  const hlm = {
    S: {c: C.blue, a: inn(1, 0.05), def: true},
    a: {c: C.yellow, a: Math.max(inside, sa), def: true}, f: {c: C.pink, a: Math.max(inside, sf), def: true},
    au: {c: C.yellow, a: inside},
    S2: {c: C.blue, a: sa}, a2: {c: C.yellow, a: sa}, S3: {c: C.blue, a: sf}, f2: {c: C.pink, a: sf},
  };
  const java = `
public class Escopo {
  [[pv|private]] static class [[M|Month]] {
    public static int [[min|min]] = 1;
    public static int [[max|max]] = 12;
  }
  public static void main(String[] a) {
    System.out.println([[M2|Month]].[[min2|min]]);
    System.out.println([[M3|Month]].[[max2|max]]);
  }
}`;
  const sj = 24;
  const gj = geom(java, sj);
  const mm = inn(2, w(2, 'Month ponto'));
  const pv = inn(4, w(4, 'private'));
  const hlj = {
    M: {c: C.blue, a: inn(2, 0.1), def: true},
    min: {c: C.yellow, a: mm, def: true}, max: {c: C.yellow, a: mm, def: true},
    M2: {c: C.blue, a: mm}, M3: {c: C.blue, a: mm}, min2: {c: C.yellow, a: mm}, max2: {c: C.yellow, a: mm},
    pv: {c: C.red, a: pv},
  };
  const grp = inn(3, w(3, 'SupplierBid ponto'));
  return (
    <>
      <Part n={2} />
      <Title text="namespace nomeado" p={ramp(frame, t(0, w(0, 'namespace')), 24)} color={C.blue} />
      <Box x={960} y={150} a="tc" p={inn(0, w(0, 'bloco que tem nome'))}>
        <Hand size={36} color={C.soft}>
          um bloco <span style={{color: C.blue}}>com nome</span>  →  acessível de fora com <span style={{fontFamily: MONO, color: C.blue}}>Nome.membro</span>
        </Hand>
      </Box>
      <Code code={ml} s={s} x={120} y={260} p={inn(1, 0)} hl={hlm} tab="ML">
        <Region r={gm.rect(1, 2, 0, 17)} color={C.blue} p={inside} label="dentro: a e f se enxergam" labelSide="right" />
        <TokLabel at={{...gm.rect(5, 6, 0, 10)}} text="de fora: S.nome" color={C.blue} p={sa} />
      </Code>
      <Code code={java} s={sj} x={1030} y={260} p={inn(2, 0)} hl={hlj} tab="Java">
        <Region r={gj.rect(1, 4, 2, 37)} color={C.blue} p={inn(2, 0.15)} pad={6} />
      </Code>
      <Box x={1030} y={260 + gj.h + 26} p={inn(2, w(2, 'Em C++'))}>
        <div style={{display: 'flex', gap: 14}}>
          <Chip color={C.blue} size={24}>Java: pacotes, classes</Chip>
          <Chip color={C.blue} size={24}>C++: namespace, class, struct</Chip>
        </div>
      </Box>
      <Box x={120} y={730} p={inn(3, 0)}>
        <Card w={780} color={C.teal}>
          <Chip color={C.teal} size={28}>1 · agrupar</Chip>
          <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 20, fontFamily: MONO, fontSize: 32}}>
            <span style={{color: grp > 0.5 ? C.muted : C.soft, textDecoration: grp > 0.5 ? 'line-through' : 'none'}}>maxSupplierBid</span>
            <span style={{color: C.muted, opacity: grp}}>→</span>
            <span style={{color: C.text, opacity: grp}}><span style={{color: C.blue}}>SupplierBid</span>.max</span>
          </div>
        </Card>
      </Box>
      <Box x={1030} y={810} p={inn(4, 0)}>
        <Card w={780} color={C.red}>
          <Chip color={C.red} size={28}>2 · ocultar informação</Chip>
          <Hand size={32} color={C.soft} style={{marginTop: 16}}>
            <span style={{fontFamily: MONO, color: C.red}}>private</span>: Month não é visível fora de Escopo
          </Hand>
        </Card>
      </Box>
    </>
  );
};
