import json, base64, urllib.request, sys, time, os
ep=sys.argv[1]; voice=sys.argv[2]
segs=json.load(open(f"{ep}/narration.json"))
URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-lite-tts:generateContent"
for s in segs:
    out=f"{ep}/audio/{s['id']}.wav"
    if os.path.exists(out): continue
    prompt=s["text"]  # plain text only: the lite TTS model reads style instructions aloud
    body={"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"responseModalities":["AUDIO"],
          "speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":voice}}}}}
    for attempt in range(6):
        try:
            req=urllib.request.Request(URL,data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":"dummy"})
            r=json.load(urllib.request.urlopen(req,timeout=120))
            d=base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
            if d[:4]!=b"RIFF":
                import wave
                with wave.open(out,"wb") as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(d)
            else: open(out,"wb").write(d)
            print(s["id"],"ok",flush=True); break
        except Exception as e:
            print(s["id"],"retry",attempt,e,flush=True); time.sleep(25)
    time.sleep(12)
