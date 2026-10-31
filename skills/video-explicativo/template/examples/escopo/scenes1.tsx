import React from 'react';
import {
  Arrow, Box, C, Card, Chip, Code, Hand, Region, Terminal, Title, TokLabel, Type, al, geom, ramp, useBeats, MONO,
} from '../lib';
import {Part} from './parts';

// ============================================================ 1. hook
export const Hook = () => {
  const {inn, out, frame, t, w} = useBeats();
  const codeA = `fun square [[a1|n]] = [[a2|n]] * [[a3|n]];\nfun double [[b1|n]] = [[b2|n]] + [[b3|n]];`;
  const sA = 40;
  const gA = geom(codeA, sA);
  const up = inn(2, 0, 22);
  const fade = out(4, 0.02, 14);
  const ta = inn(1, w(1, 'o n de square'));
  const tb = inn(1, w(1, 'o n de double'));
  const hlA = {
    a1: {c: C.teal, a: ta}, a2: {c: C.teal, a: ta}, a3: {c: C.teal, a: ta},
    b1: {c: C.yellow, a: tb}, b2: {c: C.yellow, a: tb}, b3: {c: C.yellow, a: tb},
  };

  const codeB = `fun [[s1|square]] [[s2|square]] = [[s3|square]] * [[s4|square]];`;
  const sB = 46;
  const gB = geom(codeB, sB);
  const hlB = Object.fromEntries(['s1', 's2', 's3', 's4'].map((id, k) =>
    [id, {c: C.purple, a: inn(3, 0.04 + k * 0.07, 8)}]));

  return (
    <>
      <div style={{opacity: fade}}>
        <Code code={codeA} s={sA} x={960 - gA.w / 2 - 120} y={330 - up * 180} p={inn(0, 0) * (1 - 0.55 * up)} hl={hlA}>
          <div style={{position: 'absolute', left: gA.w + 30, top: gA.py + 4}}>
            <Box x={0} y={0} p={ta}><Chip color={C.teal} size={28}>n de square</Chip></Box>
            <Box x={0} y={gA.lh} p={tb}><Chip color={C.yellow} size={28}>n de double</Chip></Box>
          </div>
        </Code>
        <Code code={codeB} s={sB} x={960 - gB.w / 2} y={430} p={inn(2, 0.3)} hl={hlB}>
          <Box x={gB.w + 26} y={gB.h / 2 - 30} p={inn(3, 0.32)}>
            <Hand size={52} color={C.purple}>4×</Hand>
          </Box>
        </Code>
        <Box x={960} y={640} a="tc" p={inn(3, w(3, 'E compila'))}>
          <Terminal s={30} lines={[
            {t: '- fun square square = square * square;'},
            {t: 'val square = fn : int -> int', c: C.muted},
            {t: '- square 3;'},
            {t: 'val it = 9 : int', c: C.green},
          ]} />
        </Box>
        <Box x={960} y={890} a="tc" p={inn(4, 0)}>
          <Hand size={44} color={C.soft}>qual square é qual?</Hand>
        </Box>
      </div>
      <Box x={960} y={380} a="tc" p={frame >= t(4, w(4, 'escopo')) ? 1 : 0} dy={0}>
        <Type text="escopo" p={ramp(frame, t(4, w(4, 'escopo')), 16)} size={150} color={C.text} />
      </Box>
      <Box x={960} y={600} a="tc" p={inn(4, 0.97)}>
        <Chip color={C.teal} size={36}>quem é quem no seu código</Chip>
      </Box>
    </>
  );
};

// ============================================================ 2. definição × ocorrência
export const Defs = () => {
  const {inn, out, frame, t, w} = useBeats();
  const fadeTop = out(5, 0, 14);
  const code = `fun [[s1|square]] [[s2|square]] = [[s3|square]] * [[s4|square]];`;
  const s = 48;
  const g = geom(code, s);
  const cx = 960 - g.w / 2;
  const fn = inn(3, 0.05);
  const par = inn(3, w(3, 'O segundo'));
  const body = inn(4, 0.05);
  const hl = {
    s1: {c: C.teal, a: fn, def: true}, s2: {c: C.teal, a: par, def: true},
    s3: {c: C.yellow, a: body}, s4: {c: C.yellow, a: body},
  };
  const p2 = g.pos('s2');
  const p3 = g.pos('s3');
  const p4 = g.pos('s4');
  const kinds = [
    {n: 1, label: 'bloco', c: C.teal, word: 'bloco'},
    {n: 2, label: 'namespace nomeado', c: C.blue, word: 'namespace nomeado'},
    {n: 3, label: 'namespace primitivo', c: C.purple, word: 'namespace primitivo'},
    {n: 4, label: 'escopo dinâmico', c: C.orange, word: 'escopo dinâmico'},
  ];
  const rise = inn(6, 0, 18);
  return (
    <>
      <Title text="definição e ocorrência" p={ramp(frame, t(0, 0.1), 26)} />
      <div style={{opacity: fadeTop}}>
        <Box x={170} y={185} p={inn(1, 0)}>
          <Card w={760} color={C.teal}>
            <Chip color={C.teal} size={34}>definição</Chip>
            <Hand size={32} color={C.soft} style={{marginTop: 14, whiteSpace: 'normal'}}>
              onde um nome ganha um significado
            </Hand>
            <Hand size={32} color={C.teal} style={{marginTop: 4}}>→ uma possível vinculação (binding)</Hand>
          </Card>
        </Box>
        <Box x={990} y={185} p={inn(2, 0)}>
          <Card w={760} color={C.yellow}>
            <Chip color={C.yellow} size={34}>ocorrência</Chip>
            <Hand size={32} color={C.soft} style={{marginTop: 14}}>cada vez que o nome aparece</Hand>
            <Hand size={32} color={C.yellow} style={{marginTop: 4}}>→ vinculada a UMA definição</Hand>
          </Card>
        </Box>
        <Code code={code} s={s} x={cx} y={560} p={inn(3, 0)} hl={hl}>
          <TokLabel at={g.pos('s1')} text={'define\na função'} color={C.teal} p={fn} />
          <TokLabel at={p2} text={'define o\nparâmetro'} color={C.teal} p={par} />
          <Arrow x1={p3.x + p3.w / 2} y1={p3.y + 6} x2={p2.x + p2.w * 0.6} y2={p2.y + 2} p={inn(4, 0.15, 16)} color={C.yellow} bend={55} />
          <Arrow x1={p4.x + p4.w / 2} y1={p4.y + 6} x2={p2.x + p2.w * 0.4} y2={p2.y - 2} p={inn(4, 0.3, 18)} color={C.yellow} bend={110} />
          <TokLabel at={{x: p3.x, y: p3.y, w: p4.x + p4.w - p3.x, h: p3.h}} text="usam o parâmetro" color={C.yellow} p={inn(4, 0.35)} />
        </Code>
        <Box x={960} y={880} a="tc" p={inn(4, w(4, '3 vezes'))}>
          <Hand size={40} color={C.soft}>square 3  →  3 × 3  =  <span style={{color: C.green}}>9</span></Hand>
        </Box>
      </div>
      <Box x={960} y={330 - rise * 130} a="tc" p={inn(5, 0.05) * (1 - 0.25 * rise)}>
        <Card w={1180} color={C.teal} pad={40}>
          <Hand size={52} color={C.teal}>escopo de uma definição</Hand>
          <Hand size={42} color={C.text} style={{marginTop: 12, whiteSpace: 'normal'}}>
            = a região do programa onde ela determina a vinculação do nome
          </Hand>
        </Card>
      </Box>
      <div style={{position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 30}}>
        {kinds.map((k) => {
          const p = inn(6, w(6, k.word));
          return (
            <div key={k.n} style={{opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
              <Card color={k.c} w={360} pad={24} style={{textAlign: 'center'}}>
                <Hand size={64} color={k.c}>{k.n}</Hand>
                <Hand size={34} color={C.text}>{k.label}</Hand>
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ============================================================ 3. blocos
export const Blocks = () => {
  const {inn, out, frame, t, w} = useBeats();
  const fade = out(3, 0, 14);
  const ml = `
let
  val [[x|x]] = 1
  val [[y|y]] = 2
in
  [[x2|x]] + [[y2|y]]
end`;
  const s = 34;
  const gm = geom(ml, s);
  const xy = inn(1, w(1, 'O x'));
  const hlm = {x: {c: C.teal, a: xy, def: true}, y: {c: C.teal, a: xy, def: true}, x2: {c: C.teal, a: xy}, y2: {c: C.teal, a: xy}};

  const fn = `
fun f (a::b::_) = a + b
  | f [a]       = a
  | f []        = 0;`;
  const gf = geom(fn, s);
  const alts = [C.teal, C.yellow, C.pink];

  const java = `
while (i < 0) {
    int [[c|c]] = i * i * i;
    p += [[c2|c]];
    q += [[c3|c]];
    i -= step;
}`;
  const sj = 36;
  const gj = geom(java, sj);
  const cc = inn(3, w(3, 'Esse c'));
  return (
    <>
      <Part n={1} p={inn(0, 0)} />
      <Title text="bloco" p={ramp(frame, t(0, 0.05), 12)} />
      <Box x={960} y={160} a="tc" p={inn(0, 0.3) * fade}>
        <Hand size={36} color={C.soft}>contém definições  →  delimita onde elas valem</Hand>
      </Box>
      <div style={{opacity: fade}}>
        <Code code={ml} s={s} x={150} y={300} p={inn(1, 0)} hl={hlm} tab="ML">
          <Region r={gm.rect(0, 5, 0, 12)} color={C.teal} p={inn(1, w(1, 'só existem'))} label="x e y valem aqui" labelSide="right" />
        </Code>
        <Code code={fn} s={s} x={900} y={300} p={inn(2, 0)} tab="ML">
          <Region r={gf.rect(0, 0, 4, 23)} color={alts[0]} p={inn(2, w(2, 'parâmetros'))} pad={6} />
          <Region r={gf.rect(1, 1, 4, 23)} color={alts[1]} p={inn(2, w(2, 'cada alternativa'))} pad={6} />
          <Region r={gf.rect(2, 2, 4, 23)} color={alts[2]} p={inn(2, w(2, 'cada alternativa') + 0.06)} pad={6} />
        </Code>
        <Box x={900} y={300 + gf.h + 40} p={inn(2, w(2, 'cada alternativa') + 0.1)}>
          <Hand size={32} color={C.soft}>cada alternativa tem o seu bloco</Hand>
          <Hand size={28} color={C.muted} style={{marginTop: 8}}>(vale também pra case … of)</Hand>
        </Box>
      </div>
      <Code code={java} s={sj} x={960 - gj.w / 2} y={300} p={inn(3, 0.08)} tab="Java / C"
        hl={{c: {c: C.teal, a: cc, def: true}, c2: {c: C.teal, a: cc}, c3: {c: C.teal, a: cc}}}>
        <Region r={gj.rect(1, 4, 0, 22)} color={C.teal} p={inn(3, w(3, 'par de chaves'))} label={'{ } = bloco\nc só existe aqui'} labelSide="right" />
      </Code>
    </>
  );
};

// ============================================================ 4. aninhamento, A − B, C vs Java
export const Nesting = () => {
  const {inn, out, frame, t, w} = useBeats();
  const fade = out(4, 0, 14);
  const ml = `
let
  val [[n1|n]] = "E agora,"
in
  let
    val [[n2|n]] = "José?"
  in
    [[n3|n]]
  end
end`;
  const s = 34;
  const g = geom(ml, s);
  const ans = inn(1, 0);
  const ab = inn(3, 0.05);
  const p2 = g.pos('n2');
  const p3 = g.pos('n3');
  const hl = {
    n1: {c: C.teal, a: ab, def: true},
    n2: {c: C.yellow, a: Math.max(ans, ab), def: true},
    n3: {c: C.yellow, a: ans},
  };
  const cx = 150;
  const cy = 220;

  const cCode = `
int main() {
  int [[n1|n]] = 0;
  {
    int [[n2|n]] = 2;
    printf("%d", [[n3|n]]);
  }
  return 0;
}`;
  const java = `
public class Escopo {
  public static void main(String[] a) {
    int [[n1|n]] = 0;
    {
      int [[n2|n]] = 2;
      System.out.println(n);
    }
  }
}`;
  const jv = inn(5, w(5, 'nem compila'));
  return (
    <>
      <Part n={1} />
      <Title text="blocos aninhados" p={ramp(frame, t(0, 0.02), 20)} />
      <div style={{opacity: fade}}>
        <Code code={ml} s={s} x={cx} y={cy} p={inn(0, 0.05)} hl={hl} badgeDefs>
          <Arrow x1={p3.x + p3.w + 8} y1={p3.y + p3.h / 2} x2={p2.x + p2.w / 2 + 4} y2={p2.y + p2.h - 2} p={inn(1, 0.1, 18)} color={C.yellow} bend={45} />
          <Region r={g.rect(0, 8, 0, 19)} color={C.teal} p={ab} label="A" fill={0.07} labelSide="left" pad={14} />
          <Region r={g.rect(3, 7, 2, 18)} color={C.yellow} p={inn(3, w(3, 'menos o buraco'))} label="B" fill={0.1} labelSide="left" />
        </Code>
        <Box x={cx + g.w + 40} y={cy + g.h / 2 - 30} p={inn(0, 0.7) * (1 - ans)}>
          <Hand size={56} color={C.muted}>= ?</Hand>
        </Box>
        <Box x={cx + g.w + 40} y={cy + g.h / 2 - 30} p={ans}>
          <Chip color={C.green} size={36} mono>"José?"</Chip>
          <Hand size={28} color={C.soft} style={{marginTop: 10}}>a mais interna ganha</Hand>
        </Box>
        <Box x={1060} y={210} p={inn(2, 0)}>
          <Card w={760} color={C.yellow} pad={30}>
            <Chip color={C.yellow} size={26}>★ cai na prova</Chip>
            <Hand size={36} color={C.text} style={{marginTop: 16, whiteSpace: 'normal'}}>
              O escopo de uma definição é o bloco que a contém, <span style={{color: C.yellow}}>menos</span> os escopos das redefinições em blocos internos.
            </Hand>
          </Card>
        </Box>
        <Box x={1060} y={600} p={inn(3, w(3, 'Escopo é A menos B'))}>
          <Hand size={52} color={C.text}>
            escopo do <span style={{color: C.teal}}>n de fora</span> = <span style={{color: C.teal}}>A</span> − <span style={{color: C.yellow}}>B</span>
          </Hand>
          <Hand size={52} color={C.text} style={{marginTop: 10}}>
            escopo do <span style={{color: C.yellow}}>n de dentro</span> = <span style={{color: C.yellow}}>B</span>
          </Hand>
        </Box>
      </div>
      <Code code={cCode} s={30} x={170} y={210} p={inn(4, 0.02)} tab="C"
        hl={{n2: {c: C.green, a: inn(4, 0.3), def: true}, n3: {c: C.green, a: inn(4, 0.3)}}} />
      <Box x={170} y={760} p={inn(4, w(4, 'imprime'))}>
        <Terminal s={26} w={560} lines={[{t: '$ gcc a.c && ./a.out', c: C.muted}, {t: '2', c: C.green}]} />
      </Box>
      <Box x={980} y={130} p={inn(5, 0)}>
        <Chip color={C.red} size={28}>! pegadinha</Chip>
      </Box>
      <Code code={java} s={26} x={980} y={210} p={inn(5, 0.05)} tab="Java"
        hl={{n1: {c: C.muted, a: jv}, n2: {c: C.red, a: jv, def: true}}} />
      <Box x={980} y={680} p={inn(5, w(5, 'nem compila') + 0.05)}>
        <Terminal s={22} w={760} lines={[
          {t: '$ javac Escopo.java', c: C.muted},
          {t: 'error: variable n is already', c: C.red},
          {t: '       defined in method main(String[])', c: C.red},
        ]} />
      </Box>
      <Box x={980} y={880} p={inn(5, w(5, 'Java não deixa'))}>
        <Hand size={30} color={C.soft} style={{whiteSpace: 'normal', width: 780}}>
          Java proíbe uma <span style={{color: C.red}}>local</span> esconder outra <span style={{color: C.red}}>local</span> do mesmo método
        </Hand>
      </Box>
      <Box x={170} y={880} p={inn(5, 0.6) * 0 + inn(4, w(4, 'imprime') + 0.15)}>
        <Hand size={30} color={C.green}>C: a interna esconde a externa ✓</Hand>
      </Box>
    </>
  );
};
export {MONO, al};
