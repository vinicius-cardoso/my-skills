import React from 'react';
import {interpolate} from 'remotion';
import {
  Arrow, Box, C, Card, Chip, Code, Hand, MONO, Terminal, Title, TokLabel, Type, al, geom, ramp, useBeats,
} from '../lib';
import {Part} from './parts';
import {GFH} from './scenes2';

// ============================================================ 7. namespace primitivo
export const Primitive = () => {
  const {inn, out, frame, t, w} = useBeats();
  const mlFade = out(2, 0, 14);
  const decl = `val [[i1|int]] = 3;`;
  const repl = `[[o1|val int = 3]] : [[o2|int]]`;
  const sd = 40;
  const gd = geom(decl, sd);
  const gr = geom(repl, sd);
  const both = inn(1, w(1, 'O int tipo'));
  const exprBoxX = 330;
  const typeBoxX = 1010;
  const boxY = 600;
  const rx = 960 - gr.w / 2;
  const ry = 380;
  const o1 = gr.pos('o1');
  const o2 = gr.pos('o2');

  const NS = [
    {k: 'pkg', label: 'pacotes', c: '#9aa4b2', word: 'pacotes'},
    {k: 'type', label: 'tipos', c: C.purple, word: 'tipos'},
    {k: 'meth', label: 'métodos', c: C.blue, word: 'métodos'},
    {k: 'var', label: 'variáveis', c: C.teal, word: 'variáveis'},
    {k: 'lab', label: 'rótulos', c: C.orange, word: 'rótulos'},
  ];
  const toLegend = inn(3, 0, 22);
  const codeFade = out(12, 0, 14);

  const reuse = `
class [[r1|Reuse]] {
  [[r2|Reuse]] [[r3|Reuse]] ([[r4|Reuse]] [[r5|Reuse]]) {
    [[r6|Reuse]]:
    for (;;) {
      if ([[r7|Reuse]].[[r8|Reuse]]([[r9|Reuse]]) == [[r10|Reuse]])
        break [[r11|Reuse]];
    }
    return [[r12|Reuse]];
  }
}`;
  const s = 33;
  const g = geom(reuse, s, 0, 1.95);
  const T = C.purple; const M = C.blue; const V = C.teal; const L = C.orange;
  const R: Record<string, [string, number, boolean]> = {
    r1: [T, inn(4, w(4, 'class')), true],
    r2: [T, inn(5, w(5, 'primeiro')), false],
    r3: [M, inn(6, 0.05), true],
    r4: [T, inn(7, w(7, 'tipo do parâmetro')), false],
    r5: [V, inn(7, w(7, 'nome do parâmetro')), true],
    r6: [L, inn(8, 0.05), true],
    r7: [V, inn(9, w(9, 'primeiro')), false],
    r8: [M, inn(9, w(9, 'segundo')), false],
    r9: [V, inn(9, w(9, 'terceiro')), false],
    r10: [V, inn(9, w(9, 'quarto')), false],
    r11: [L, inn(10, 0.05), false],
    r12: [V, inn(10, w(10, 'return')), false],
  };
  const hl = Object.fromEntries(Object.entries(R).map(([id, [c, a, def]]) => [id, {c, a, def, dashed: !def}]));
  const defs = [
    {id: 'r1', t: 'class Reuse', ns: 'tipo', c: T},
    {id: 'r3', t: 'Reuse(...)', ns: 'método', c: M},
    {id: 'r5', t: 'parâmetro Reuse', ns: 'variável', c: V},
    {id: 'r6', t: 'Reuse:', ns: 'rótulo', c: L},
  ];
  const count = defs.filter((d) => R[d.id][1] > 0.5).length;
  const final = inn(11, 0.02);
  const cErr = inn(12, w(12, 'não compila'));
  const cCode = `
int main() {
    int [[ii|int]] = 2;
    printf("%d", [[iu|int]]);
}`;
  const gc = geom(cCode, 36);

  return (
    <>
      <Part n={3} />
      <Title text="namespace primitivo" p={ramp(frame, t(0, w(0, 'namespace')), 24)} color={C.purple} />
      <Box x={960} y={150} a="tc" p={inn(0, w(0, 'vêm de fábrica')) * mlFade}>
        <Hand size={36} color={C.soft}>vêm de fábrica: definidos pela própria linguagem</Hand>
      </Box>
      <div style={{opacity: mlFade}}>
        <Code code={decl} s={sd} x={960 - gd.w / 2} y={240} p={inn(1, w(1, 'val int'))} tab="ML" hl={{i1: {c: C.teal, a: both}}} />
        <Code code={repl} s={sd} x={rx} y={ry} p={inn(1, w(1, 'é válido'))} tab="resposta do ML"
          hl={{o1: {c: C.teal, a: both}, o2: {c: C.purple, a: both}}} />
        <Box x={exprBoxX} y={boxY} p={inn(1, w(1, 'dois'))}>
          <Card w={580} color={C.teal} pad={28}>
            <Hand size={34} color={C.teal}>expressões</Hand>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              <Chip color={C.teal} size={28} mono fill={0.08 + 0.2 * both}>int = 3</Chip>
              <Chip color={C.muted} size={28} mono>square</Chip>
              <Chip color={C.muted} size={28} mono>x</Chip>
            </div>
          </Card>
        </Box>
        <Box x={typeBoxX} y={boxY} p={inn(1, w(1, 'outro pra expressões'))}>
          <Card w={580} color={C.purple} pad={28}>
            <Hand size={34} color={C.purple}>tipos</Hand>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              <Chip color={C.purple} size={28} mono fill={0.08 + 0.2 * both}>int</Chip>
              <Chip color={C.muted} size={28} mono>real</Chip>
              <Chip color={C.muted} size={28} mono>string</Chip>
            </div>
          </Card>
        </Box>
        <Arrow x1={rx + o1.x + o1.w / 2} y1={ry + o1.y + o1.h} x2={exprBoxX + 290} y2={boxY - 6} p={inn(1, w(1, 'O int tipo') + 0.05, 18)} color={C.teal} bend={30} />
        <Arrow x1={rx + o2.x + o2.w / 2} y1={ry + o2.y + o2.h} x2={typeBoxX + 290} y2={boxY - 6} p={inn(1, w(1, 'O int tipo'), 18)} color={C.purple} bend={-30} />
        <Box x={960} y={890} a="tc" p={inn(1, w(1, 'não se esbarram'))}>
          <Hand size={36} color={C.soft}>ML: <span style={{color: C.text}}>2</span> namespaces primitivos, sem conflito</Hand>
        </Box>
      </div>

      {/* Java's five namespaces: big row → legend */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: interpolate(toLegend, [0, 1], [430, 138]),
        display: 'flex', justifyContent: 'center', gap: interpolate(toLegend, [0, 1], [28, 14]),
        opacity: codeFade,
      }}>
        {NS.map((n) => {
          const p = inn(2, w(2, n.word));
          return (
            <div key={n.k} style={{opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
              <Chip color={n.c} size={interpolate(toLegend, [0, 1], [46, 24])}>{n.label}</Chip>
            </div>
          );
        })}
      </div>
      <Box x={960} y={560} a="tc" p={inn(2, 0.1) * (1 - toLegend)}>
        <Hand size={40} color={C.soft}>Java: <span style={{color: C.text}}>5</span> namespaces primitivos</Hand>
      </Box>

      <div style={{opacity: codeFade}}>
        <Code code={reuse} s={s} x={90} y={215} p={inn(3, 0.25)} hl={hl} badgeDefs lhMul={1.95} tab="Java · compila!" />
        <Box x={1000} y={600} p={inn(4, 0) * (1 - final)}>
          <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
            <Chip color={C.text} size={22} style={{fontFamily: MONO, fontWeight: 700, background: C.text, color: C.bg}}>DEF</Chip>
            <Hand size={28} color={C.soft}>= definição</Hand>
            <div style={{width: 60, height: 30, border: `2px dashed ${C.soft}`, borderRadius: 7}} />
            <Hand size={28} color={C.soft}>= uso</Hand>
          </div>
        </Box>
        <Box x={1000} y={230} p={inn(4, 0)}>
          <Card w={800} pad={30}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
              <Hand size={40} color={C.text}>definições:</Hand>
              <Hand size={72} color={final > 0 ? C.green : C.yellow}>{count}</Hand>
            </div>
            {defs.map((d) => {
              const p = R[d.id][1];
              return (
                <div key={d.id} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, opacity: p, transform: `translateX(${(1 - p) * 20}px)`}}>
                  <span style={{fontFamily: MONO, fontSize: 28, color: C.text, width: 330}}>{d.t}</span>
                  <Chip color={d.c} size={26}>{d.ns}</Chip>
                </div>
              );
            })}
            <Hand size={28} color={C.muted} style={{marginTop: 22, opacity: inn(10, 0.5)}}>o resto (8 ocorrências) é uso</Hand>
          </Card>
        </Box>
        <Box x={1000} y={740} p={final}>
          <Card w={800} color={C.yellow} pad={24}>
            <Chip color={C.yellow} size={24}>★ P2 anterior, questão 10</Chip>
            <Hand size={32} color={C.text} style={{marginTop: 12}}>
              mesmo código com <span style={{fontFamily: MONO}}>Transacao</span> → <span style={{color: C.green}}>4 definições</span>
            </Hand>
          </Card>
        </Box>
      </div>

      <Code code={cCode} s={36} x={960 - gc.w / 2} y={260} p={inn(12, 0.05)} tab="C"
        hl={{ii: {c: C.red, a: cErr, def: true}, iu: {c: C.red, a: cErr}}} />
      <Box x={960} y={560} a="tc" p={inn(12, w(12, 'não compila') + 0.05)}>
        <Terminal s={26} lines={[
          {t: '$ gcc b.c', c: C.muted},
          {t: 'error: two or more data types in declaration specifiers', c: C.red},
        ]} />
      </Box>
      <Box x={960} y={760} a="tc" p={inn(12, w(12, 'palavra reservada'))}>
        <Chip color={C.red} size={34}>em C, int é palavra reservada</Chip>
      </Box>
    </>
  );
};

// ============================================================ 8. estático × dinâmico
const Frame: React.FC<{name: string; vars: React.ReactNode; p: number; y: number; hl?: string}> = ({name, vars, p, y, hl}) => (
  <Box x={1010} y={y} p={p}>
    <div style={{
      width: 760, height: 100, borderRadius: 12, border: `2px solid ${hl ?? C.border}`, background: hl ? al(hl, 0.08) : C.panel,
      display: 'flex', alignItems: 'center', gap: 26, padding: '0 26px',
    }}>
      <span style={{fontFamily: MONO, fontSize: 36, color: C.blue, width: 50}}>{name}</span>
      <span style={{fontFamily: MONO, fontSize: 30, color: C.soft, display: 'flex', gap: 28}}>{vars}</span>
    </div>
  </Box>
);

export const Dynamic = () => {
  const {inn, out, frame, t, w} = useBeats();
  const cardsFade = out(2, 0, 14);
  const sceneFade = out(9, 0, 14);
  const s = 30;
  const g = geom(GFH, s);
  const cx = 110;
  const cy = 190;
  const fG = inn(3, 0.05);
  const fH = inn(4, 0.05);
  const fF = inn(5, 0.05);
  const st = inn(6, w(6, 'onde f foi definida'));
  const dy = inn(7, w(7, 'pergunta pra quem chamou'));
  const hl = {
    incu: {c: C.yellow, a: inn(5, w(5, 'qual inc'))},
    inc1: {c: C.teal, a: st, def: true},
    inc2: {c: C.orange, a: dy, def: true},
  };
  const cur: [number, number, number][] = [[t(3, 0), 0, 3], [t(3, 0.6), 11, 1], [t(4, 0), 4, 5], [t(5, 0), 3, 1]];
  let ci = -1;
  cur.forEach((c, i) => { if (frame >= c[0]) ci = i; });
  let cursor;
  if (ci >= 0) {
    const prev = ci > 0 ? cur[ci - 1] : cur[ci];
    const k = ramp(frame, cur[ci][0], 10);
    cursor = {line: interpolate(k, [0, 1], [prev[1], cur[ci][1]]), n: interpolate(k, [0, 1], [prev[2], cur[ci][2]]), a: fG * out(6, 0, 10)};
  }
  const pu = g.pos('incu');
  const p1 = g.pos('inc1');
  const yG = 780;
  const yH = 664;
  const yF = 548;
  return (
    <>
      <Part n={4} />
      <Title text="estático × dinâmico" p={ramp(frame, t(0, 0.02), 22)} color={C.orange} />
      <div style={{opacity: cardsFade}}>
        <Box x={150} y={230} p={inn(0, w(0, 'escopo estático'))}>
          <Card w={780} color={C.teal} pad={34}>
            <Chip color={C.teal} size={34}>estático (léxico)</Chip>
            <Hand size={36} color={C.text} style={{marginTop: 20}}>resolvido na <span style={{color: C.teal}}>compilação</span></Hand>
            <Hand size={32} color={C.soft} style={{marginTop: 8}}>só lendo o texto do programa</Hand>
            <Hand size={32} color={C.muted} style={{marginTop: 8}}>quase todas as linguagens</Hand>
          </Card>
        </Box>
        <Box x={990} y={230} p={inn(1, 0)}>
          <Card w={780} color={C.orange} pad={34}>
            <Chip color={C.orange} size={34}>dinâmico</Chip>
            <Hand size={36} color={C.text} style={{marginTop: 20}}>resolvido na <span style={{color: C.orange}}>execução</span></Hand>
            <Hand size={32} color={C.soft} style={{marginTop: 8}}>não achou? procura em quem chamou</Hand>
            <Hand size={32} color={C.muted} style={{marginTop: 8}}>e em quem chamou esse, e assim por diante</Hand>
          </Card>
        </Box>
        <Box x={960} y={680} a="tc" p={inn(1, w(1, 'quem chamou a função'))}>
          <div style={{display: 'flex', gap: 18, alignItems: 'center', fontFamily: MONO, fontSize: 36}}>
            {['f', 'h', 'g', '…'].map((n, i) => (
              <React.Fragment key={n}>
                {i > 0 && <span style={{color: C.orange, opacity: inn(1, w(1, 'quem chamou a função') + i * 0.08)}}>→</span>}
                <span style={{opacity: inn(1, w(1, 'quem chamou a função') + i * 0.08)}}><Chip color={C.orange} size={32} mono>{n}</Chip></span>
              </React.Fragment>
            ))}
          </div>
        </Box>
      </div>
      <div style={{opacity: sceneFade}}>
        <Code code={GFH} s={s} x={cx} y={cy} p={inn(2, 0.05)} hl={hl} cursor={cursor} tab="Lista 10 · ML" badgeDefs>
          <Arrow x1={pu.x + pu.w / 2} y1={pu.y + pu.h * 0.1} x2={p1.x + p1.w + 4} y2={p1.y + p1.h * 0.85} p={inn(6, w(6, 'f foi escrita'), 18)} color={C.teal} bend={14} />
          <TokLabel at={pu} text="qual?" color={C.yellow} p={inn(5, w(5, 'qual inc')) * (1 - st)} above />
        </Code>
        <Box x={1390} y={200} a="tc" p={inn(2, w(2, 'Quanto vale')) * (1 - inn(6, 0.0))}>
          <Hand size={80} color={C.text}>g 5 = ?</Hand>
        </Box>
        <Box x={1010} y={190} p={inn(6, w(6, 'Resultado'))}>
          <Chip color={C.teal} size={40}>estático:  5 + 1 = 6</Chip>
        </Box>
        <Box x={1010} y={290} p={inn(7, w(7, 'Resultado'))}>
          <Chip color={C.orange} size={40}>dinâmico:  5 + 2 = 7</Chip>
        </Box>
        <Box x={1010} y={yF - 50} p={fG}>
          <Hand size={30} color={C.muted}>pilha de chamadas (execução)</Hand>
        </Box>
        <Frame name="g" y={yG} p={fG} vars={<><span>x = 5</span><span style={{color: st > 0 ? C.teal : C.soft}}>inc = 1</span></>} />
        <Frame name="h" y={yH} p={fH} hl={dy > 0.5 ? C.orange : undefined}
          vars={<><span>z = 5</span><span style={{color: dy > 0.5 ? C.orange : C.soft}}>inc = 2</span></>} />
        <Frame name="f" y={yF} p={fF} vars={<><span>y = 5</span><span style={{color: C.yellow}}>y + inc = ?</span></>} />
        <Box x={880} y={yG + 24} p={fH}><Hand size={28} color={C.muted}>{'↑ chama h 5'}</Hand></Box>
        <Box x={880} y={yH + 24} p={fF}><Hand size={28} color={C.muted}>{'↑ chama f 5'}</Hand></Box>
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1} />
        <div style={{position: 'absolute', left: 0, top: 0}}>
          <Arrow x1={1776} y1={yF + 50} x2={1776} y2={yH + 50} p={inn(7, w(7, 'Quem chamou foi h'), 16)} color={C.orange} bend={-55} w={4} />
          <Box x={1800} y={yF + 70} p={inn(7, w(7, 'Quem chamou foi h') + 0.05)}><Hand size={28} color={C.orange}>caller</Hand></Box>
        </div>
        <Box x={960} y={935} a="tc" p={inn(8, 0)}>
          <Hand size={40} color={C.text}>
            <span style={{color: C.teal}}>estático</span> → onde a função foi <u>definida</u>
            <span style={{color: C.dim}}>   ·   </span>
            <span style={{color: C.orange}}>dinâmico</span> → de onde foi <u>chamada</u>
          </Hand>
        </Box>
      </div>
      <Box x={960} y={210} a="tc" p={inn(9, w(9, 'LISP'))}>
        <div style={{display: 'flex', gap: 20}}>
          <Chip color={C.orange} size={40} mono>LISP</Chip>
          <Chip color={C.orange} size={40} mono>APL</Chip>
        </div>
      </Box>
      <Box x={960} y={360} a="tc" p={inn(9, w(9, 'tem problemas'))}>
        <Card w={1100} color={C.red} pad={36}>
          {[
            ['difícil de implementar de forma eficiente', 'difícil'],
            ['cria escopos enormes', 'cria escopos'],
            ['quem chama pode mudar o comportamento da função', 'quem chama'],
          ].map(([txt, word]) => (
            <div key={word} style={{opacity: inn(9, w(9, word)), display: 'flex', gap: 20, marginTop: 10}}>
              <Hand size={40} color={C.red}>✗</Hand>
              <Hand size={40} color={C.text}>{txt}</Hand>
            </div>
          ))}
        </Card>
      </Box>
    </>
  );
};

// ============================================================ 9. pegadinha: redefinição
export const Redef = () => {
  const {inn, frame, t, w} = useBeats();
  const code = `
val [[x1|x]] = 10;
fun [[f|f]] y = [[xu|x]] + y;
val [[x2|x]] = 20;
[[fu|f]] 1;`;
  const s = 44;
  const g = geom(code, s, 22);
  const x0 = 300;
  const y0 = 300;
  const lineAt = [w(0, 'val x igual a 10'), w(0, 'f de y'), w(0, 'Depois'), w(0, 'Quanto')];
  const res = inn(1, 0.02);
  const link = inn(1, w(1, 'já estava'));
  const nova = inn(1, w(1, 'definição nova'));
  const px = g.pos('xu');
  const p1 = g.pos('x1');
  const p2 = g.pos('x2');
  const pf = g.pos('fu');
  return (
    <>
      <Box x={56} y={50} p={inn(0, 0)}><Chip color={C.red} size={24}>! pegadinha</Chip></Box>
      <Title text="redefinir não muda o passado" p={ramp(frame, t(0, 0.02), 28)} color={C.red} />
      <Code code={code} s={s} x={x0} y={y0} p={inn(0, 0)} tab="ML"
        lineOp={(i) => inn(0, lineAt[i])}
        hl={{x1: {c: C.teal, a: link, def: true}, xu: {c: C.teal, a: link}, x2: {c: C.yellow, a: nova, def: true}}}>
        <Arrow x1={px.x + px.w / 2} y1={px.y + px.h * 0.1} x2={p1.x + p1.w + 4} y2={p1.y + p1.h * 0.85} p={inn(1, w(1, 'já estava'), 18)} color={C.teal} bend={12} />
        <Box x={pf.x + 6 * g.cw} y={pf.y} p={inn(0, lineAt[3] + 0.05) * (1 - res)}>
          <Hand size={52} color={C.muted}>= ?</Hand>
        </Box>
        <Box x={pf.x + 6 * g.cw} y={pf.y - 6} p={res}>
          <Hand size={60} color={C.green}>= 11</Hand>
        </Box>
        <Box x={p2.x + 12 * g.cw} y={p2.y + 10} p={nova}>
          <Hand size={30} color={C.yellow}>definição nova, só vale daqui pra baixo</Hand>
        </Box>
      </Code>
      <Box x={x0} y={y0 + g.h + 50} p={inn(1, w(1, 'vinculada'))}>
        <Hand size={38} color={C.soft}>
          f ficou vinculada ao <span style={{color: C.teal}}>x = 10</span> que existia quando ela foi <u>definida</u>
        </Hand>
        <Hand size={32} color={C.muted} style={{marginTop: 12}}>(não é 21 — isso seria pensar em "variável que muda")</Hand>
      </Box>
    </>
  );
};

// ============================================================ 10. resumo + desafio
export const Recap = () => {
  const {inn, out, frame, t, w, end} = useBeats();
  const cardsFade = out(5, 0, 14);
  const items = [
    {b: 1, c: C.teal, h: 'escopo = A − B', l: ['vale a definição mais interna', 'Java: local não esconde local']},
    {b: 2, c: C.purple, h: 'contar definições', l: ['DEF: classe, método, parâmetro, rótulo', 'uso: tipo de retorno, tipo do parâmetro, chamadas']},
    {b: 3, c: C.blue, h: 'namespaces primitivos', l: ['ML: 2 (tipos, expressões)  ·  Java: 5', 'C: int é palavra reservada']},
    {b: 4, c: C.orange, h: 'estático × dinâmico', l: ['estático → onde a função foi definida', 'dinâmico → quem chamou']},
  ];
  const node = `
class [[c|Node]] {
  int [[fd|Node]];
  [[rt|Node]] [[m|Node]]([[pt|Node]] n) {
    int x = n.[[nu|Node]];
    return n;
  }
}`;
  const s = 36;
  const g = geom(node, s, 0, 1.95);
  const ans = inn(6, 0.02);
  const a1 = inn(6, w(6, 'A classe'));
  const a2 = inn(6, w(6, 'o campo'));
  const a3 = inn(6, w(6, 'e o método'));
  const u = inn(6, w(6, 'O tipo de retorno'));
  const hl = {
    c: {c: C.purple, a: a1, def: true}, fd: {c: C.teal, a: a2, def: true}, m: {c: C.blue, a: a3, def: true},
    rt: {c: C.purple, a: u, dashed: true}, pt: {c: C.purple, a: u, dashed: true}, nu: {c: C.teal, a: u, dashed: true},
  };
  const cdStart = end(5);
  const cd = Math.floor((frame - cdStart) / 30);
  const qFade = out(7, 0, 14);
  return (
    <>
      <Title text="resumo pra prova" p={ramp(frame, t(0, 0.05), 20) * cardsFade} />
      <div style={{opacity: cardsFade}}>
        {items.map((it, i) => {
          const p = inn(it.b, 0);
          return (
            <Box key={i} x={i % 2 === 0 ? 150 : 990} y={i < 2 ? 200 : 560} p={p}>
              <Card w={780} color={it.c} pad={34} style={{height: 300}}>
                <Hand size={48} color={it.c}>{it.h}</Hand>
                {it.l.map((line) => (
                  <Hand key={line} size={32} color={C.text} style={{marginTop: 18, whiteSpace: 'normal'}}>{line}</Hand>
                ))}
              </Card>
            </Box>
          );
        })}
      </div>
      <div style={{opacity: qFade}}>
        <Box x={960} y={60} a="tc" p={inn(5, 0)}>
          <Chip color={C.yellow} size={34}>desafio · questão 1.3 do guia</Chip>
        </Box>
        <Code code={node} s={s} x={200} y={200} p={inn(5, 0.05)} hl={hl} badgeDefs lhMul={1.95} tab="Java · compila" />
        <Box x={200} y={200 + g.h + 40} p={inn(5, w(5, 'Quantas'))}>
          <Hand size={44} color={C.text}>quantas definições do nome <span style={{fontFamily: MONO, color: C.yellow}}>Node</span>?</Hand>
        </Box>
        {frame >= cdStart && cd < 3 && !ans && (
          <Box x={1400} y={420} a="c" p={1} dy={0}>
            <Hand size={220} color={al(C.yellow, 1 - ((frame - cdStart) % 30) / 45)}>{3 - cd}</Hand>
          </Box>
        )}
        <Box x={1050} y={300} p={ans}>
          <Card w={720} color={C.green} pad={32}>
            <Hand size={64} color={C.green}>3 definições</Hand>
            <Hand size={30} color={C.text} style={{marginTop: 14}}>classe · campo int Node · método</Hand>
            <Hand size={30} color={C.muted} style={{marginTop: 10}}>usos: tipo de retorno, tipo do parâmetro, n.Node</Hand>
            <Hand size={30} color={C.soft} style={{marginTop: 14}}>alternativa B</Hand>
          </Card>
        </Box>
      </div>
      <Box x={960} y={330} a="tc" p={inn(7, 0.05)}>
        <Hand size={40} color={C.muted}>próximo vídeo</Hand>
      </Box>
      <Box x={960} y={410} a="tc" p={frame >= t(7, w(7, 'tipos')) ? 1 : 0} dy={0}>
        <Type text="tipos algébricos" p={ramp(frame, t(7, w(7, 'tipos')), 22)} size={110} color={C.teal} />
      </Box>
      <Box x={960} y={620} a="tc" p={inn(7, 0.6)}>
        <Hand size={30} color={C.dim}>DCC024 · Linguagens de Programação · Prova 2</Hand>
      </Box>
    </>
  );
};
