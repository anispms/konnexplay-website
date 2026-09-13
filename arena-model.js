import * as THREE from 'three';

/* Box cricket arena, modelled from the venue photographs.
   Real-world metres, y-up, centred on the origin. */

const M = {
  turf:    new THREE.MeshStandardMaterial({ name: 'turf',    color: 0x5FA83C, roughness: 0.95, metalness: 0 }),
  pitch:   new THREE.MeshStandardMaterial({ name: 'pitch',   color: 0x3E6B2B, roughness: 0.9,  metalness: 0 }),
  kerb:    new THREE.MeshStandardMaterial({ name: 'kerb',    color: 0xCFCBC2, roughness: 0.85, metalness: 0 }),
  steel:   new THREE.MeshStandardMaterial({ name: 'steel',   color: 0x2F3A33, roughness: 0.55, metalness: 0.35 }),
  redband: new THREE.MeshStandardMaterial({ name: 'redband', color: 0xB1382C, roughness: 0.7,  metalness: 0.1 }),
  netting: new THREE.MeshStandardMaterial({ name: 'netting', color: 0x184034, roughness: 1, metalness: 0, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }),
  sheet:   new THREE.MeshStandardMaterial({ name: 'sheet',   color: 0xE8E6E1, roughness: 0.65, metalness: 0.15 }),
  lamp:    new THREE.MeshStandardMaterial({ name: 'lamp',    color: 0xFFF6D8, roughness: 0.3,  metalness: 0.1, emissive: 0xFFEEB0, emissiveIntensity: 0.55 }),
  stump:   new THREE.MeshStandardMaterial({ name: 'stump',   color: 0xE8C21C, roughness: 0.6,  metalness: 0 })
};

/* arena footprint */
const W = 34, D = 22, H = 12;
const hw = W / 2, hd = D / 2;

function mesh(geo, mat, name, x, y, z) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  m.position.set(x, y, z);
  return m;
}

/* a lattice tower: two chords with X bracing, as in the photographs */
function tower(name, x, z, height) {
  const g = new THREE.Group();
  g.name = name;
  const leg = 0.34, r = 0.055;
  const chord = new THREE.BoxGeometry(r * 2, height, r * 2);
  [[-leg, -leg], [leg, -leg], [-leg, leg], [leg, leg]].forEach((p, i) => {
    g.add(mesh(chord, M.steel, name + '_chord' + i, p[0], height / 2, p[1]));
  });
  const bays = Math.max(4, Math.round(height / 1.5));
  const bayH = height / bays;
  const diag = new THREE.BoxGeometry(0.045, Math.hypot(leg * 2, bayH), 0.045);
  const tie = new THREE.BoxGeometry(leg * 2, 0.05, 0.05);
  for (let b = 0; b < bays; b++) {
    const y0 = b * bayH;
    const a = Math.atan2(leg * 2, bayH);
    [-1, 1].forEach((s, k) => {
      const d1 = mesh(diag, M.steel, name + '_br' + b + '_' + k, 0, y0 + bayH / 2, s * leg);
      d1.rotation.z = (b % 2 ? a : -a);
      g.add(d1);
      const d2 = mesh(diag, M.steel, name + '_bx' + b + '_' + k, s * leg, y0 + bayH / 2, 0);
      d2.rotation.x = (b % 2 ? -a : a);
      g.add(d2);
    });
    g.add(mesh(tie, M.steel, name + '_tieA' + b, 0, y0, -leg));
    g.add(mesh(tie, M.steel, name + '_tieB' + b, 0, y0, leg));
    const tz = mesh(tie, M.steel, name + '_tieC' + b, -leg, y0, 0);
    tz.rotation.y = Math.PI / 2; g.add(tz);
    const tz2 = mesh(tie, M.steel, name + '_tieD' + b, leg, y0, 0);
    tz2.rotation.y = Math.PI / 2; g.add(tz2);
  }
  /* the painted red band at the foot, seen on every upright */
  g.add(mesh(new THREE.BoxGeometry(leg * 2 + 0.16, 1.1, leg * 2 + 0.16), M.redband, name + '_band', 0, 0.75, 0));
  g.position.set(x, 0, z);
  return g;
}

/* a truss beam spanning two towers */
function truss(name, x, y, z, len, along) {
  const g = new THREE.Group();
  g.name = name;
  const r = 0.05, sep = 0.42;
  const chord = new THREE.BoxGeometry(len, r * 2, r * 2);
  [[0, -sep / 2], [0, sep / 2], [sep, -sep / 2], [sep, sep / 2]].forEach((p, i) => {
    g.add(mesh(chord, M.steel, name + '_c' + i, 0, p[0], p[1]));
  });
  const n = Math.max(4, Math.round(len / 1.4));
  const seg = len / n;
  const diag = new THREE.BoxGeometry(0.04, Math.hypot(seg, sep), 0.04);
  for (let i = 0; i < n; i++) {
    const px = -len / 2 + seg * (i + 0.5);
    const a = Math.atan2(sep, seg);
    [-1, 1].forEach((s, k) => {
      const d = mesh(diag, M.steel, name + '_d' + i + '_' + k, px, sep / 2, s * sep / 2);
      d.rotation.z = Math.PI / 2 - (i % 2 ? a : -a);
      g.add(d);
    });
  }
  g.position.set(x, y, z);
  if (!along) g.rotation.y = Math.PI / 2;
  return g;
}

export function buildArena() {
  const arena = new THREE.Group();
  arena.name = 'box_cricket_arena';

  /* ground: turf pad on a low kerb */
  arena.add(mesh(new THREE.BoxGeometry(W + 1.2, 0.35, D + 1.2), M.kerb, 'kerb', 0, 0.175, 0));
  const turf = mesh(new THREE.BoxGeometry(W, 0.06, D), M.turf, 'turf', 0, 0.36, 0);
  turf.receiveShadow = true;
  arena.add(turf);

  /* two synthetic pitch strips, as in the drone view */
  arena.add(mesh(new THREE.BoxGeometry(18, 0.02, 2.6), M.pitch, 'pitch_1', -1, 0.4, -4.6));
  arena.add(mesh(new THREE.BoxGeometry(18, 0.02, 2.6), M.pitch, 'pitch_2', -1, 0.4, 4.6));

  /* stumps at each pitch end */
  const stumpGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.72, 12);
  [[-9.6, -4.6], [7.6, -4.6], [-9.6, 4.6], [7.6, 4.6]].forEach((p, i) => {
    for (let s = -1; s <= 1; s++) {
      arena.add(mesh(stumpGeo, M.stump, 'stumps_' + i + '_' + (s + 1), p[0], 0.77, p[1] + s * 0.11));
    }
  });

  /* corner and intermediate towers */
  const towerXs = [-hw, -hw / 3, hw / 3, hw];
  towerXs.forEach((x, i) => {
    arena.add(tower('tower_n' + i, x, -hd, i === 0 || i === 3 ? H : H - 1.5));
    arena.add(tower('tower_s' + i, x, hd, i === 0 || i === 3 ? H : H - 1.5));
  });
  arena.add(tower('tower_e0', -hw, 0, H - 1.5));
  arena.add(tower('tower_e1', hw, 0, H - 1.5));

  /* perimeter and roof trusses */
  [-hd, hd].forEach((z, s) => {
    arena.add(truss('truss_top_' + s, 0, H - 0.3, z, W, true));
    arena.add(truss('truss_mid_' + s, 0, H * 0.55, z, W, true));
  });
  [-hw, hw].forEach((x, s) => {
    arena.add(truss('truss_end_' + s, x, H - 0.3, 0, D, false));
  });
  /* roof crossbeams */
  towerXs.forEach((x, i) => {
    arena.add(truss('truss_roof_' + i, x, H - 0.5, 0, D, false));
  });

  /* netting: four walls and a roof */
  const wallGeoLong = new THREE.PlaneGeometry(W, H);
  const wallGeoEnd = new THREE.PlaneGeometry(D, H);
  [[-hd, 0], [hd, Math.PI]].forEach((p, i) => {
    const n = mesh(wallGeoLong, M.netting, 'net_side_' + i, 0, H / 2 + 0.36, p[0]);
    n.rotation.y = p[1];
    arena.add(n);
  });
  [[-hw, Math.PI / 2], [hw, -Math.PI / 2]].forEach((p, i) => {
    const n = mesh(wallGeoEnd, M.netting, 'net_end_' + i, p[0], H / 2 + 0.36, 0);
    n.rotation.y = p[1];
    arena.add(n);
  });
  const roof = mesh(new THREE.PlaneGeometry(W, D), M.netting, 'net_roof', 0, H - 0.2, 0);
  roof.rotation.x = -Math.PI / 2;
  arena.add(roof);

  /* floodlights on the tall corner towers */
  const headGeo = new THREE.BoxGeometry(0.9, 0.55, 0.16);
  const armGeo = new THREE.BoxGeometry(0.5, 0.08, 0.08);
  [[-hw, -hd, 1, 1], [hw, -hd, -1, 1], [-hw, hd, 1, -1], [hw, hd, -1, -1]].forEach((p, i) => {
    arena.add(mesh(armGeo, M.steel, 'lamp_arm_' + i, p[0] + p[2] * 0.45, H - 0.9, p[1]));
    const head = mesh(headGeo, M.lamp, 'floodlight_' + i, p[0] + p[2] * 0.95, H - 0.9, p[1]);
    head.rotation.y = p[2] * 0.5;
    head.rotation.x = 0.45 * p[3];
    arena.add(head);
  });
  /* the run of lamps along the near sideline, each bracketed to its tower */
  towerXs.forEach((x, i) => {
    const y = H - 1.8;
    const arm = mesh(armGeo, M.steel, 'lamp_arm_side_' + i, x, y, -hd + 0.28);
    arm.rotation.y = Math.PI / 2;
    arena.add(arm);
    const head = mesh(headGeo, M.lamp, 'floodlight_side_' + i, x, y, -hd + 0.56);
    head.rotation.x = 0.42;
    arena.add(head);
  });

  /* the white sheet-metal shed beside the arena */
  const shed = new THREE.Group();
  shed.name = 'shed';
  shed.add(mesh(new THREE.BoxGeometry(12, 4.2, 7), M.sheet, 'shed_body', 0, 2.1, 0));
  const roofSlab = mesh(new THREE.BoxGeometry(12.8, 0.18, 7.6), M.sheet, 'shed_roof', 0, 4.35, 0);
  roofSlab.rotation.z = 0.035;
  shed.add(roofSlab);
  shed.position.set(hw + 7.4, 0, -hd + 3);
  arena.add(shed);

  /* compound wall along the far side */
  arena.add(mesh(new THREE.BoxGeometry(W + 8, 2.4, 0.25), M.sheet, 'compound_wall_far', 2, 1.2, hd + 1.4));
  /* the east wall runs from the far corner down to the shed, which closes the rest of that side */
  arena.add(mesh(new THREE.BoxGeometry(0.25, 2.4, 16.6), M.sheet, 'compound_wall_east', hw + 6, 1.2, 4.06));

  arena.traverse((o) => { if (o.isMesh && o.material !== M.netting) { o.castShadow = true; } });

  /* centre on the origin in plan, base still resting at y = 0 */
  const bb = new THREE.Box3().setFromObject(arena);
  const c = bb.getCenter(new THREE.Vector3());
  arena.position.x -= c.x;
  arena.position.z -= c.z;
  return arena;
}
