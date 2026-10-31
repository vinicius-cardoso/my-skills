import asyncio, subprocess, sys
from pathlib import Path
import edge_tts
OUT = Path(sys.argv[1])
VOICES = [  # (number, voice, label)
    (1, "pt-BR-AntonioNeural", "masc"), (2, "en-US-AndrewMultilingualNeural", "masc"),
    (3, "en-US-BrianMultilingualNeural", "masc"), (4, "de-DE-FlorianMultilingualNeural", "masc"),
    (5, "fr-FR-RemyMultilingualNeural", "masc"),
    (6, "pt-BR-ThalitaMultilingualNeural", "fem"), (7, "pt-BR-FranciscaNeural", "fem"),
    (8, "en-US-AvaMultilingualNeural", "fem"), (9, "en-US-EmmaMultilingualNeural", "fem"),
    (10, "de-DE-SeraphinaMultilingualNeural", "fem"),
]
TEXT = ("Voz {n}. Com escopo estático, vale o inc de onde a função f foi definida: g de 5 dá 6. "
        "Já no escopo dinâmico, f pergunta pra quem chamou, e o lookup acha inc igual a 2. "
        "Resultado: 7. E isso cai na prova!")
async def one(n, v, g):
    p = OUT / f"{n:02d}-{g}-{v.split('-')[2].replace('MultilingualNeural','').replace('Neural','')}.mp3"
    for a in range(4):
        try:
            await edge_tts.Communicate(TEXT.format(n=n), v, rate="+6%").save(str(p)); return p
        except Exception as e:
            await asyncio.sleep(2)
    raise RuntimeError(v)
async def main():
    files = []
    for n, v, g in VOICES:  # sequential: the service rate-limits bursts
        files.append(await one(n, v, g))
    # one combined file with 1s of silence between voices
    lst = OUT / "list.txt"
    sil = OUT / "sil.mp3"
    subprocess.run(["ffmpeg","-v","error","-y","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t","1.0","-c:a","libmp3lame","-b:a","48k",str(sil)],check=True)
    lst.write_text("".join(f"file '{f.name}'\nfile 'sil.mp3'\n" for f in files))
    subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",str(lst),"-af","loudnorm=I=-16:TP=-1.5","-ar","44100","-b:a","128k",str(OUT.parent/"todas-as-vozes.mp3")],check=True)
    lst.unlink(); sil.unlink()
asyncio.run(main())
