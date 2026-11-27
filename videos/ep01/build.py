"""Build index.html from template.html + narration audio timing."""
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
segs = json.load(open(f"{HERE}/narration.json"))
LEAD, GAP, TAIL = 0.4, 0.45, 1.8
def dur(p):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]).decode())
t = LEAD; out = []; audio = []
for i, s in enumerate(segs):
    p = f"audio/{s['id']}.wav"
    if os.path.exists(f"{HERE}/{p}"):
        d = dur(f"{HERE}/{p}"); audio.append(f'<audio id="a_{s["id"]}" src="{p}" data-start="{t:.3f}" data-duration="{d:.3f}" data-track-index="{2+i%2}"></audio>')
    else:
        d = round(len(s["text"]) / 4.4, 2); print("placeholder", s["id"], d)
    out.append({"id": s["id"], "text": s["text"], "start": round(t, 3), "dur": round(d, 3)})
    t += d + GAP
total = round(t - GAP + TAIL, 2)
html = open(f"{HERE}/template.html.tpl").read()
html = html.replace("__TIMING__", json.dumps({"total": total, "segs": out}, ensure_ascii=False))
html = html.replace("__TOTAL__", str(total)).replace("__AUDIO__", "\n  ".join(audio))
open(f"{HERE}/index.html", "w").write(html)
print("total", total)
