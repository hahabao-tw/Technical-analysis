"""Microsoft (Edge) TTS narration: python3 tools/ms_tts.py <narration.json> <outdir> <voice> <rate> <pitch>"""
import asyncio, json, os, ssl, subprocess, sys, edge_tts, edge_tts.communicate as _c
if os.path.exists('/root/.ccr/ca-bundle.crt'):  # sandbox proxy CA
    _c._SSL_CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
src, out, voice, rate, pitch = sys.argv[1:6]
os.makedirs(out, exist_ok=True)
async def main():
    for s in json.load(open(src)):
        mp3 = f"{out}/{s['id']}.mp3"
        if os.path.exists(f"{out}/{s['id']}.wav"): continue
        for k in range(60):
            try:
                await edge_tts.Communicate(s["text"], voice, rate=rate, pitch=pitch).save(mp3)
                if os.path.getsize(mp3) > 2000: break
            except Exception as e: pass
            await asyncio.sleep(4)
        else: raise SystemExit(f"{s['id']}: Microsoft TTS gave no audio after retries")
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",mp3,"-af","adelay=60","-ar","24000","-ac","1",f"{out}/{s['id']}.wav"],check=True)
        os.remove(mp3); print(s["id"], "ok", flush=True)
asyncio.run(main())
