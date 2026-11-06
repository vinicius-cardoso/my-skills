# DCC024 – Prova 2 video series

Course folder: `~/Documents/university/coursework/14th_semester/DCC024_LINGUAGENS_DE_PROGRAMACAO/`
(`01_Classes/A2` slides, `02_Problem_Set/A2` lists with *Enunciado*/*Gabarito*/*Solutions*/*Explicacoes*,
`03_Exams/` study guide, past exam and `Exemplos de Código` zips). Exam: 2026-11-04, ~10 multiple-choice
questions (A–E), mostly "given this code, what happens?".

The study guide `03_Exams/Guia-P2.pdf` splits the content in 9 steps. Each step has a summary (★ = falls on
the exam, ! = trap), 4 practice questions, and the commented answers at the end ("Gabarito comentado").
Use the practice questions for the challenge at the end of each video.

| # | Video id | Topic (guide step) | Slides (`01_Classes/A2`) | List (`02_Problem_Set/A2`) | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `escopo` | Escopo de Variáveis | `11-scope.pdf` | Lista10 | done (2026-10-31) |
| 2 | `tipos-algebricos` | Tipos Algébricos | `12-algebric-types.pdf` | Lista11 | done (2026-10-31) |
| 3 | `registros-ativacao` | Registros de Ativação | `13-activation-records.pdf` | Lista12 | done (2026-10-31) |
| 4 | `java-intro` | Introdução à Linguagem Java | `14-first-look-java.pdf` | Lista13 | done (2026-10-31) |
| 5 | `memoria` | Gerenciamento de Memória | `15-memory-management.pdf` | Lista14 | done (2026-10-31) |
| 6 | `tads` | Tipos Abstratos de Dados | `16-second-look-java.pdf` | Lista15 | done (2026-10-31) |
| 7 | `poo` | Programação Orientada a Objetos | `17-object-orientation.pdf` (+ `Aula17-Material_Complementar.zip`) | Lista16 | done (2026-10-31) |
| 8 | `erros` | Tratamento de Erros | `18-java-third-look.pdf` | Lista17 | done (2026-10-31) |
| 9 | `parametros` | Passagem de Parâmetros | `19-paramters.pdf` (+ `21-parameters-examples.zip`) | Lista18 (+ Explicacoes) | done (2026-10-31) |

Notes:
- The previous P2 (solved in the guide, "A P2 anterior resolvida") had 4 questions on parameter passing,
  4 on memory management, 1 on activation records, 1 on scope. Those topics deserve the most worked examples.
- Watermark text: `DCC024 · <topic>`. End each video with "No próximo vídeo: <next topic>".
- Update the Status column when a video is delivered.
- Course-material errors found while verifying (teach the verified version): Lista 10 key (`Reuse.Reuse`
  first token is the parameter); Lista 12 key code isn't valid SML (`fun rec`, `val bar x`); slide
  `int fact(n)` doesn't compile; memory slide shows freeStart 3 where the code gives 2, and its v2
  `deallocate` misses `memory[previousP+1] = p` when merging on both sides; Lista 14 key puts global
  `const c = rand()` on the stack (it's static); Lista 16 key ex. 2/3 (downcast called forbidden,
  parameter variance wrong); the guide says `Object.create` copies (it delegates); a parameters slide
  writes `MIN` with `<` instead of `<=`.
