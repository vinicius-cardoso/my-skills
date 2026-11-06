"""Synthesize narration beats with edge-tts and build the timeline for Remotion.

usage: .venv/bin/python tools/tts.py <video-id>      (e.g. escopo)

Reads  content/<id>/narration.json
Writes studio/public/<id>/<hash>.mp3, studio/public/<id>/timeline.json, out/<NN>-<id>.srt
(NN = "number" in narration.json, the episode order; plain out/<id>.srt if absent)
"""
import asyncio
import fcntl
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
FPS = 30
HEAD = 0.45  # silence before the first beat of a scene
GAP = 0.40  # silence between beats
TAIL = 0.90  # silence after the last beat of a scene

# Display text -> what the voice should read.
SAY = {
    r"\bC\+\+": "C mais mais",
    r"\bML\b": "M L",
    r"\bAPL\b": "A P L",
    r"\bLISP\b": "Lisp",
    r"\bint int\b": "int, int",
}


def say_text(text: str) -> str:
    for pat, rep in SAY.items():
        text = re.sub(pat, rep, text)
    return text


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(out.strip())


async def synth(text: str, voice: str, rate: str, path: Path, sem: asyncio.Semaphore):
    async with sem:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(text, voice, rate=rate).save(str(path))
                return
            except Exception as e:  # network hiccups
                if attempt == 3:
                    raise
                print(f"  retry {attempt + 1}: {e}")
                await asyncio.sleep(2)


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


async def main(vid: str):
    spec = json.loads((ROOT / "content" / vid / "narration.json").read_text())
    voice, rate = spec["voice"], spec.get("rate", "+0%")
    pub = ROOT / "studio" / "public" / vid
    pub.mkdir(parents=True, exist_ok=True)

    jobs, sem = [], asyncio.Semaphore(4)
    for scene in spec["scenes"]:
        norm = []
        for b in scene["beats"]:
            b = {"text": b} if isinstance(b, str) else b
            spoken = say_text(b["text"])
            h = hashlib.sha1(f"{voice}|{rate}|{spoken}".encode()).hexdigest()[:12]
            b["file"] = f"{h}.mp3"
            if not (pub / b["file"]).exists():
                jobs.append(synth(spoken, voice, rate, pub / b["file"], sem))
            norm.append(b)
        scene["beats"] = norm
    print(f"synthesizing {len(jobs)} new beats")
    await asyncio.gather(*jobs)

    t = 0.0
    scenes, srt = [], []
    for scene in spec["scenes"]:
        start = t
        cur = HEAD
        beats = []
        for b in scene["beats"]:
            d = duration(pub / b["file"])
            beats.append({
                "from": round(cur * FPS),
                "dur": round(d * FPS),
                "audio": f"{vid}/{b['file']}",
                "text": b["text"],
            })
            srt.append((start + cur, start + cur + d, b["text"]))
            cur += d + GAP + b.get("pause", 0)
        total = cur - GAP + TAIL
        scenes.append({"id": scene["id"], "from": round(start * FPS),
                       "dur": round(total * FPS), "beats": beats})
        t += total

    # make scene boundaries exactly contiguous in frames
    for a, b in zip(scenes, scenes[1:]):
        a["dur"] = b["from"] - a["from"]
    timeline = {"fps": FPS, "dur": scenes[-1]["from"] + scenes[-1]["dur"], "scenes": scenes}
    (pub / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1))

    out = ROOT / "out"
    out.mkdir(exist_ok=True)
    name = f"{spec['number']:02d}-{vid}" if "number" in spec else vid
    (out / f"{name}.srt").write_text("".join(
        f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{txt}\n\n" for i, (a, b, txt) in enumerate(srt, 1)))
    print(f"total {timeline['dur'] / FPS:.1f}s, {len(scenes)} scenes")
    for s in scenes:
        print(f"  {s['id']:10} {s['from'] / FPS:6.1f}s  +{s['dur'] / FPS:5.1f}s  {len(s['beats'])} beats")


if __name__ == "__main__":
    # one synthesis at a time across all sessions/agents (edge-tts rate-limits bursts)
    with open("/tmp/vg-tts.lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        asyncio.run(main(sys.argv[1]))
