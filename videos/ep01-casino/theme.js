// EP01 · casino theme (original design: felt table, chips, cards, marquee bulbs, gold serif)
const T = {
  colors: { up: 0xe8233f, dn: 0x14b86a, hi: 0xf5c451, lo: 0xdfe6f0, red: 0xff2a4a },
  fonts: ['900 40px "Noto Serif TC"', '700 40px "Cinzel"'],
  roundBodies: true,
  bodyGeo: (THREE) => new THREE.CylinderGeometry(0.5, 0.5, 1, 40),
  markerGeo: (THREE) => { const g = new THREE.CylinderGeometry(1, 1, 0.28, 48); g.rotateX(Math.PI / 2); return g; }, // coin facing camera
  titles: [
    "",
    "<i>◆ 第一手 ◆</i>先找轉折點",
    "<i>◆ 莊家看漲 ◆</i>多頭結構",
    "<i>◆ 莊家看跌 ◆</i>空頭結構",
    "<i>◆ 牌局未明 ◆</i>盤整",
    "<i>◆ 翻牌了 ◆</i>結構破壞",
    "<i>◆ 別這樣下注 ◆</i>兩個常見錯誤",
    "",
  ],
  dom($) {
    $("brand").innerHTML = '<span class="ms">TABLE 01</span>技術分析';
    $("tcard").innerHTML = '<div class="marquee"><div class="ep">EPISODE 01</div><div class="t">市場結構</div><div class="s">用高低點判斷趨勢</div></div>';
    $("outro").innerHTML =
      '<div class="k">莊家的一句話</div><div class="m">趨勢就是<br/><span>高低點</span>的方向</div>' +
      '<div class="nx"><div class="chip"><b>EP</b>02</div><div><small>NEXT TABLE</small>支撐壓力為什麼會互換？</div></div>';
    const hud = document.createElement("div");
    hud.id = "hud"; hud.className = "ov";
    hud.innerHTML = '<small>籌碼</small><b id="cash">0</b><div class="delta" id="delta"></div>';
    $("root").appendChild(hud);
    document.querySelectorAll(".card .ic").forEach((el, i) => (el.textContent = i < 2 ? "✕" : "✓"));
    document.querySelectorAll(".card").forEach((el, i) => el.insertAdjacentHTML("beforeend", `<span class="suit">${"♠♥♦♣"[i]}</span>`));
  },
  setup(c) {
    const { THREE, scene, floor, grid, wall, rng } = c;
    scene.fog = new THREE.Fog(0x1a0508, 22, 44);
    grid.visible = false; wall.visible = false;
    floor.material = new THREE.MeshLambertMaterial({ color: 0x14060a });
    c.key.color = new THREE.Color(0xffe2b0); c.key.intensity = 1.4;
    c.rim.color = new THREE.Color(0xff8a5c); c.rim.intensity = 1.2;
    const spot = new THREE.SpotLight(0xfff0d0, 70, 40, 0.6, 0.6, 1.4);
    spot.position.set(0, 14, 4); spot.target.position.set(0, 0, 0); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024);
    scene.add(spot, spot.target);
    // felt table with printed arcs and lettering (canvas texture)
    const feltTex = (() => { const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 1024; const g = cv.getContext("2d");
      const gr = g.createRadialGradient(512, 420, 60, 512, 512, 720); gr.addColorStop(0, "#137043"); gr.addColorStop(1, "#05281a");
      g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024); const r = rng(3);
      for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.08})`; g.fillRect(r() * 1024, r() * 1024, 2, 2); }
      g.strokeStyle = "rgba(245,196,81,.75)"; g.lineWidth = 6;
      g.beginPath(); g.arc(512, 120, 760, 0.22 * Math.PI, 0.78 * Math.PI); g.stroke();
      g.beginPath(); g.arc(512, 120, 640, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke();
      g.fillStyle = "rgba(245,196,81,.8)"; g.font = '900 34px "Noto Serif TC"'; g.textAlign = "center";
      g.fillText("技術分析 · 只看高低點", 512, 905);
      g.font = '700 22px "Cinzel"'; g.fillText("TREND PAYS  ·  RANGE PUSHES", 512, 945);
      return new THREE.CanvasTexture(cv); })();
    feltTex.colorSpace = THREE.SRGBColorSpace;
    const felt = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ map: feltTex, roughness: 0.95 }));
    felt.rotation.x = -Math.PI / 2; felt.position.set(0, -0.33, 4); felt.receiveShadow = true; scene.add(felt);
    const gold = new THREE.MeshPhysicalMaterial({ color: 0xc9962e, metalness: 1, roughness: 0.25, clearcoat: 1 });
    const rail = new THREE.MeshPhysicalMaterial({ color: 0x3b0d10, roughness: 0.4, clearcoat: 1 });
    const railMesh = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.45, 20, 120), rail);
    railMesh.rotation.x = -Math.PI / 2; railMesh.scale.set(1, 1, 1); railMesh.position.set(0, -0.2, 4); scene.add(railMesh);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(7.72, 0.06, 12, 120), gold);
    ring.rotation.x = -Math.PI / 2; ring.position.set(0, -0.12, 4); scene.add(ring);
    // poker chips (stacks) in the foreground
    const chipTex = (col) => { const cv = document.createElement("canvas"); cv.width = 256; cv.height = 32; const g = cv.getContext("2d");
      g.fillStyle = col; g.fillRect(0, 0, 256, 32); g.fillStyle = "#fff"; for (let i = 0; i < 8; i++) g.fillRect(i * 32 + 8, 0, 14, 32);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const chipCols = ["#c4142b", "#1846b8", "#151515", "#0f7a3e", "#6b1fa3"];
    const chipG = new THREE.CylinderGeometry(0.42, 0.42, 0.11, 40);
    const chipMats = chipCols.map((cc) => { const side = new THREE.MeshPhysicalMaterial({ map: chipTex(cc), roughness: 0.35, clearcoat: 0.6 });
      const top = new THREE.MeshPhysicalMaterial({ color: cc, roughness: 0.35, clearcoat: 0.6 }); return [side, top, top]; });
    const r = rng(23);
    const stacks = [[-4.6, 3.2, 9], [-3.9, 4.4, 6], [-5.0, 5.4, 4], [4.4, 3.0, 11], [3.8, 4.4, 7], [4.9, 5.4, 3]];
    stacks.forEach(([x, z, n], si) => { for (let k = 0; k < n; k++) { const m = new THREE.Mesh(chipG, chipMats[(si + (k > n / 2 ? 1 : 0)) % chipMats.length]);
      m.position.set(x + (r() - 0.5) * 0.05, -0.27 + k * 0.115, z + (r() - 0.5) * 0.05); m.rotation.y = r() * 6; m.castShadow = true; scene.add(m); } });
    // playing cards lying on the felt (original simple faces)
    const cardTex = (rank, suit, red) => { const cv = document.createElement("canvas"); cv.width = 250; cv.height = 350; const g = cv.getContext("2d");
      g.fillStyle = "#fbf7ee"; g.beginPath(); g.roundRect(0, 0, 250, 350, 22); g.fill(); g.strokeStyle = "#d9cfb8"; g.lineWidth = 4; g.stroke();
      g.fillStyle = red ? "#c8102e" : "#111"; g.font = '700 64px "Cinzel"'; g.fillText(rank, 18, 74); g.font = "60px serif"; g.fillText(suit, 22, 140);
      g.font = "150px serif"; g.textAlign = "center"; g.fillText(suit, 125, 250);
      const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
    [["A", "♠", 0, -1.6, 6.2, 0.25], ["K", "♥", 1, -0.6, 6.6, -0.12], ["Q", "♦", 1, 1.0, 6.3, 0.3]].forEach(([rk, su, red, x, z, rot]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.4), new THREE.MeshStandardMaterial({ map: cardTex(rk, su, red), roughness: 0.6, transparent: true }));
      m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, -0.31, z); scene.add(m); });
  },
  update(t, c) {
    const { $, D, dkey, si, T: TT, lin, clamp } = c;
    const d = D[dkey]; const i = Math.max(0, d.lastVisible ?? 0); const b = d.bars[i];
    $("cash").textContent = Math.round(10000 + b.c * 2500).toLocaleString("en-US");
    const prev = d.bars[Math.max(0, i - 1)]; const up = b.c >= prev.c;
    $("delta").textContent = (up ? "▲ " : "▼ ") + Math.abs(Math.round((b.c - prev.c) * 2500)).toLocaleString("en-US");
    $("delta").style.color = up ? "#ff5a6e" : "#3ddc8a";
    $("hud").style.opacity = si === 7 ? 0 : 1;
    // coins spin gently
    for (const k of ["bull", "bear", "range", "brk", "mis"]) (D[k].mk || []).forEach((m, j) => (m.s.rotation.y = Math.sin(t * 2.2 + j) * 0.6));
    // marquee bulbs chase
    const mq = document.querySelector("#tcard .marquee"); if (mq) mq.style.setProperty("--ph", (Math.floor(t * 8) % 2) ? "1" : "0");
    const s7 = TT(7); const chip = document.querySelector("#outro .chip");
    if (chip) chip.style.transform = `rotateY(${(1 - c.eout(lin(t, s7 + 2, s7 + 3.2))) * 540}deg)`;
  },
};
export default T;
