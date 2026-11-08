"""Check the narration of a video with Whisper: every beat must be heard exactly as written, in Portuguese.

usage: .venv-qa/bin/python tools/check_narration.py <video-id> [scene-id ...]
       (run tools/setup_qa.sh once per machine first; tools/tts.py <id> must have run)

Reads  studio/public/<id>/timeline.json (the beats that will actually be rendered)
Writes studio/public/<id>/qa.json: what Whisper heard for each beat

Thalita is a multilingual voice: a word that looks English ("binding", "stack", "default") can come out
with an English accent or flip the whole sentence to English, and a beat can come back truncated.
Both sides are normalized first (tts.SAY applied; spaces, punctuation, number formatting and colloquial
forms like "pra"/"para" ignored), then compared by character error rate (CER):
  ok      identical, in Portuguese
  listen  CER <= 0.08: a letter or a short word differs ("Olha"/"Olhe", "um"/"o"). Usually Whisper, not the
          voice; listen to that mp3 before rendering.
  FAIL    not Portuguese, or CER > 0.08: English accent/words, a wrong word, a truncated beat.
edge-tts is deterministic, so re-synthesizing doesn't fix a failure: rephrase the beat or add a SAY entry.

Results are cached per mp3 (its name is the hash of voice|rate|text) and Whisper profile, so after an edit
only the changed beats are transcribed again. Whisper runs on the GPU if there is one, else on the CPU
(tools/hw.py). One check at a time machine-wide (/tmp/vg-whisper.lock): parallel agents would only thrash.
Exit 1 if any beat FAILs (listen-only beats don't fail the run).
"""
import fcntl
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hw  # noqa: E402

hw.use_cuda_libs()

import jiwer  # noqa: E402
import numpy as np  # noqa: E402
from ptnorm import key, norm  # noqa: E402
from tts import say_text  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MAX_CER = 0.08
# Conversational forms the voice says but Whisper writes in full (compared after ptnorm.norm).
COLLOQUIAL = {"pra": "para", "pras": "para as", "pro": "para o", "pros": "para os", "ta": "esta",
              "tá": "está", "tô": "estou", "to": "estou", "cê": "você", "num": "não"}


def ckey(text: str) -> str:
    return key(" ".join(COLLOQUIAL.get(w, w) for w in norm(text).split()))


def verdict(spoken: str, heard: str, lang: str) -> tuple[str, float]:
    cer = jiwer.cer(ckey(spoken), ckey(heard)) if heard else 1.0
    if lang != "pt" or cer > MAX_CER:
        return "FAIL", cer
    return ("ok" if cer == 0 else "listen"), cer


def pcm16k(path: Path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-ar", "16000", "-ac", "1",
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0


def main(vid: str, only: list[str]):
    pub = ROOT / "studio" / "public" / vid
    timeline = json.loads((pub / "timeline.json").read_text())
    qa_file = pub / "qa.json"
    old = json.loads(qa_file.read_text()) if qa_file.exists() else {}
    whisper_id = "%(model)s/%(device)s/%(compute_type)s" % hw.profile()

    qa = dict(old)
    model, checked, reused, failed, listen = None, 0, 0, [], []
    for scene in timeline["scenes"]:
        if only and scene["id"] not in only:
            continue
        for i, b in enumerate(scene["beats"]):
            name = Path(b["audio"]).name
            spoken = say_text(b["text"])
            r = old.get(name)
            if r and r.get("whisper") == whisper_id and r.get("spoken") == spoken:
                reused += 1
                fresh = False
            else:
                if model is None:
                    model = hw.load_model()
                segs, info = model.transcribe(pcm16k(ROOT / "studio" / "public" / b["audio"]),
                                              language=None, beam_size=5)
                r = {"heard": " ".join(s.text for s in segs).strip(), "spoken": spoken, "lang": info.language,
                     "lang_prob": round(info.language_probability, 2), "whisper": whisper_id}
                checked += 1
                fresh = True
            # the verdict is recomputed every run, so a rule change doesn't need a new transcription
            r["status"], cer = verdict(spoken, r["heard"], r["lang"])
            r["cer"] = round(cer, 3)
            r["file"] = b["audio"]
            qa[name] = r
            tag = f"{scene['id']}:{i}"
            if r["status"] == "FAIL":
                failed.append(tag)
            elif r["status"] == "listen":
                listen.append(f"{tag} (studio/public/{b['audio']})")
            if fresh or r["status"] != "ok":
                print(f"{tag:14} {r['status']:6} cer={r['cer']:.3f} {r['lang']}({r['lang_prob']:.2f}) | {r['heard']}",
                      flush=True)
                if r["status"] != "ok":
                    print(f"{'':14} {'script':6} {r['spoken']}", flush=True)
    qa_file.write_text(json.dumps(qa, ensure_ascii=False, indent=1))
    print(f"[qa] {checked} beat(s) transcribed, {reused} unchanged (previous result reused); "
          f"{len(failed)} FAIL, {len(listen)} to listen to")
    for item in listen:
        print(f"[qa] listen: {item}")
    if failed:
        print("[qa] FAILED (rephrase the beat or add a SAY entry in tools/tts.py, then tts.py + this again): "
              + " ".join(failed))
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    with open("/tmp/vg-whisper.lock", "w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        main(sys.argv[1], sys.argv[2:])
