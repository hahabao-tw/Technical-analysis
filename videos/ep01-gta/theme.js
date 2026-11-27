// EP01 · open-world action-game theme (original design: sunset city, neon road, mission HUD)
const T = {
  colors: { up: 0xff2f6d, dn: 0x1ff2b5, hi: 0xffd23f, lo: 0x3df5ff, red: 0xff2448 },
  fonts: ['400 40px "Bungee"'],
  titles: [
    "",
    "<i>NEW OBJECTIVE</i>找出轉折點",
    "<i>OBJECTIVE</i>認出多頭地盤",
    "<i>OBJECTIVE</i>認出空頭地盤",
    "<i>WARNING</i>盤整：混戰區",
    "<i>ALERT</i>結構破壞",
    "<i>TIPS</i>兩個常見錯誤",
    "",
  ],
  dom($) {
    $("brand").innerHTML = '<span class="ms">MISSION 01</span>技術分析';
    $("tcard").innerHTML = '<div class="ep">MISSION 01</div><div class="t">市場結構</div><div class="s">用高低點判斷趨勢</div>';
    $("outro").innerHTML =
      '<div class="done">任務完成</div><div class="xp">+100 XP　趨勢判斷力 ▲</div>' +
      '<div class="k">記住一句話</div><div class="m">趨勢就是<br/><span>高低點</span>的方向</div>' +
      '<div class="nx"><small>NEXT MISSION · EP02</small>支撐壓力為什麼會互換？</div>';
    const hud = document.createElement("div");
    hud.id = "hud"; hud.className = "ov";
    hud.innerHTML = '<div class="cash">$<b id="cash">0</b></div><div class="delta" id="delta"></div><div class="bars"><i id="hp"></i></div>';
    $("root").appendChild(hud);
    const obj = document.createElement("div");
    obj.id = "obj"; obj.className = "ov"; $("root").appendChild(obj);
  },
  setup(c) {
    const { THREE, scene, floor, grid, wall, rng, glowTex } = c;
    scene.fog = new THREE.Fog(0x4a1660, 18, 52);
    floor.material = new THREE.MeshLambertMaterial({ color: 0x170a26 });
    grid.material.color = new THREE.Color(0xff4fd8); grid.material.opacity = 0.55;
    wall.visible = false;
    c.key.color = new THREE.Color(0xffc7a0); c.rim.color = new THREE.Color(0xff5fd2); c.rim.intensity = 2.2;
    // road stripes running toward the camera
    const lane = new THREE.MeshBasicMaterial({ color: 0xffd23f, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.1), lane);
      m.rotation.x = -Math.PI / 2; m.position.set(0, -0.33, 2.2 + i * 2.2); scene.add(m); }
    // sun disc
    const sunTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 512; const g = cv.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#ffe36e"); gr.addColorStop(0.55, "#ff7a3c"); gr.addColorStop(1, "#ff2f8f");
      g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = "destination-out"; for (let k = 0; k < 7; k++) g.fillRect(0, 300 + k * 30, 512, 6 + k * 2.2);
      return new THREE.CanvasTexture(cv); })();
    const sun = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ map: sunTex, transparent: true, fog: false }));
    sun.position.set(0, 9, -60); sun.scale.setScalar(2.2); scene.add(sun);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff6a8a, transparent: true, opacity: 0.55, fog: false, depthWrite: false }));
    halo.position.set(0, 9, -61); halo.scale.set(70, 70, 1); scene.add(halo);
    // skyline with lit windows
    const winTex = (() => { const cv = document.createElement("canvas"); cv.width = 64; cv.height = 128; const g = cv.getContext("2d");
      g.fillStyle = "#1a0b2e"; g.fillRect(0, 0, 64, 128); const r = rng(5);
      for (let y = 4; y < 124; y += 8) for (let x = 4; x < 60; x += 8) if (r() > 0.7) { g.fillStyle = r() > 0.5 ? "#ffcf6a" : "#6ef3ff"; g.fillRect(x, y, 4, 5); }
      const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
    const r = rng(17);
    for (let row = 0; row < 3; row++) for (let i = 0; i < 16; i++) {
      const w = 2 + r() * 2.5, h = 3 + r() * (row === 0 ? 6 : 12), d = 2 + r() * 2;
      const tex = winTex.clone(); tex.needsUpdate = true; tex.repeat.set(Math.max(1, w / 1.2), Math.max(1, h / 2.4));
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: 0x2a1240, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55, roughness: 0.8 }));
      m.position.set(-34 + i * 4.4 + r() * 1.5, h / 2 - 0.35, -16 - row * 7 - r() * 3); scene.add(m);
    }
    c.sun = sun;
  },
  update(t, c) {
    const { $, D, dkey, si, S, T: TT, vis, lin, clamp } = c;
    // money HUD follows the price of the bar on screen
    const d = D[dkey]; const i = Math.max(0, d.lastVisible ?? 0); const b = d.bars[i];
    const cash = Math.round(10000 + b.c * 2500);
    $("cash").textContent = cash.toLocaleString("en-US");
    const prev = d.bars[Math.max(0, i - 1)]; const up = b.c >= prev.c;
    $("delta").textContent = (up ? "+$" : "-$") + Math.abs(Math.round((b.c - prev.c) * 2500)).toLocaleString("en-US");
    $("delta").style.color = up ? "#ff4f7d" : "#1ff2b5";
    $("hp").style.width = 25 + 70 * clamp(b.c / 5) + "%";
    $("hud").style.opacity = si === 7 ? 0 : 1;
    // objective line under the brand
    const obj = ["", "目標：標出波段<b>高點</b>和<b>低點</b>", "目標：確認<b>高點</b>、<b>低點</b>都墊高", "目標：確認<b>高點</b>、<b>低點</b>都下降",
      "目標：辨認<b>沒有方向</b>的盤整", "目標：盯住<b>前低</b>有沒有被跌破", "目標：避開兩個<b>新手陷阱</b>", ""][si];
    const o = $("obj"); if (o.dataset.t !== obj) { o.innerHTML = obj; o.dataset.t = obj; }
    const [a, bb] = c.win(si); o.style.opacity = obj ? vis(t, a + 0.3, bb, 0.3, 0.3) : 0;
    // outro: mission complete stamp
    const s7 = TT(7); const p = lin(t, s7 - 0.2, s7 + 0.5);
    const done = document.querySelector("#outro .done");
    if (done) done.style.transform = `skewX(-8deg) scale(${1 + (1 - c.eout(p)) * 1.6})`;
    c.sun.position.y = 9 - 1.2 * (t / c.EP.total);
  },
};
export default T;
