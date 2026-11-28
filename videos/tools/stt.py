import json,base64,urllib.request,sys
for p in sys.argv[1:]:
    b=base64.b64encode(open(p,'rb').read()).decode()
    body={"contents":[{"parts":[{"inline_data":{"mime_type":"audio/wav","data":b}},{"text":"逐字轉錄這段語音（繁體中文），並在每個句子前標註開始秒數，格式 [秒] 文字。只輸出轉錄。"}]}]}
    req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json","x-goog-api-key":"dummy"})
    try:
        r=json.load(urllib.request.urlopen(req,timeout=180)); print("==",p); print(r["candidates"][0]["content"]["parts"][0]["text"])
    except Exception as e: print(p,e,getattr(e,'read',lambda:b'')()[:300])
