import './style.css';
import {
  BgMode,
  CameraPose,
  LOOP_DURATION,
  PromenadeRenderer,
  SceneMode,
  wrapTime,
} from './gl/promenadeRenderer';
import {
  LANDMARKS,
  LandmarkInfo,
  buildPromenadeScene,
  laneCenterX,
  walkGroundHeightAt,
} from './scene/promenadeBuilder';
import { playFootstepSound, playStokeKilnSound } from './audio/sfx';

declare global {
  interface Window {
    renderAt?: (t: number, modeOverride?: SceneMode) => void;
    setBgMode?: (bg: BgMode) => void;
    setCameraView?: (view: LandmarkInfo['id'] | 'cruise') => void;
    setPlayerPos?: (x: number, z: number) => void;
    stokeKiln?: () => void;
    __renderReady?: boolean;
    __aiBgReady?: boolean;
    __promStats?: Record<string, unknown>;
  }
}

type NavMode = 'cruise' | 'walk';

const MODE_LABELS: Record<SceneMode, string> = {
  dusk: '❄️ 暮雪炉火',
  eclipse: '🌗 日食掠影',
  morning: '☀️ 雪霁晨光',
  night: '🌙 深冬星夜',
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function findLandmarkAt(z: number): LandmarkInfo {
  for (const lm of LANDMARKS) {
    if (z >= lm.zMin && z <= lm.zMax) return lm;
  }
  return z > LANDMARKS[0].zMax ? LANDMARKS[0] : LANDMARKS[LANDMARKS.length - 1];
}

function cruiseZAtTime(t: number): number {
  // Smooth continuous ping-pong stroll into the village depth (+19.0 -> -20.5 -> +19.0)
  const phase = wrapTime(t) / LOOP_DURATION;
  const s = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
  return 19.0 - s * 39.5;
}

function targetCamForView(
  playerX: number,
  playerZ: number,
  navMode: NavMode,
): CameraPose {
  const groundY = walkGroundHeightAt(playerZ);
  const camZ = playerZ + (navMode === 'cruise' ? 6.2 : 5.8);
  return {
    x: playerX * 0.55 + laneCenterX(camZ) * 0.45,
    y: groundY + (navMode === 'cruise' ? 2.65 : 2.45),
    z: camZ,
    targetX: laneCenterX(playerZ - 6.5) * 0.65 + playerX * 0.35,
    targetY: groundY + 1.92,
    targetZ: playerZ - 8.5,
  };
}

function bootstrap(): void {
  const maybeCanvas = document.getElementById('gl-canvas') as HTMLCanvasElement | null;
  if (!maybeCanvas) throw new Error('Missing #gl-canvas');
  const canvas: HTMLCanvasElement = maybeCanvas;

  const loadingBadge = document.getElementById('loading-badge');
  const phaseLabel = document.getElementById('phase-label');
  const bgBadge = document.getElementById('bg-badge');
  const storyText = document.getElementById('story-text');
  const btnInteract = document.getElementById('btn-interact');
  const timeSlider = document.getElementById('time-slider') as HTMLInputElement | null;
  const timeReadout = document.getElementById('time-readout');
  const btnPlay = document.getElementById('btn-play');

  const bgBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.bg-btn'));
  const navBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.nav-btn'));
  const modeBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.mode-btn'));
  const viewBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.view-btn'));

  const params = new URLSearchParams(window.location.search);
  const rawMode = params.get('mode');
  let mode: SceneMode =
    rawMode === 'eclipse' || rawMode === 'morning' || rawMode === 'night' || rawMode === 'dusk'
      ? rawMode
      : 'dusk';

  let bgMode: BgMode = params.get('bg') === 'proc' ? 'proc' : 'ai';

  const rawView = params.get('view') as LandmarkInfo['id'] | null;
  let pinnedView: LandmarkInfo | null =
    LANDMARKS.find((l) => l.id === rawView) ?? null;

  let navMode: NavMode =
    params.get('nav') === 'walk' || pinnedView ? 'walk' : 'cruise';

  let simTime = params.has('t') ? wrapTime(Number(params.get('t')) || 0) : 2.5;
  let isPlaying = !params.has('t');

  // Initial deep-corridor hero coordinates
  let playerZ = params.has('pz')
    ? clamp(Number(params.get('pz')) || 16.5, -23.5, 21.5)
    : pinnedView
      ? pinnedView.playerZ
      : navMode === 'cruise'
        ? cruiseZAtTime(simTime)
        : 16.5;
  let playerX = params.has('px')
    ? clamp(
        Number(params.get('px')) || laneCenterX(playerZ),
        laneCenterX(playerZ) - 2.1,
        laneCenterX(playerZ) + 2.1,
      )
    : laneCenterX(playerZ);
  let playerYaw = Math.PI; // facing forward along -Z into the village corridor
  let walkSpeed = 0;
  let stepCooldown = 0;
  let kilnBoost = 0;
  let clickTarget: { x: number; z: number } | null = null;

  // Smooth mouse parallax in [-1..1]
  let targetMousePx = 0;
  let targetMousePy = 0;
  let mousePx = 0;
  let mousePy = 0;

  let cam: CameraPose = targetCamForView(playerX, playerZ, navMode);

  const scene = buildPromenadeScene();
  window.__renderReady = false;
  window.__aiBgReady = false;

  const renderer = new PromenadeRenderer(canvas, scene, () => {
    window.__aiBgReady = renderer.aiBgReady;
    drawFrame();
  });
  window.__aiBgReady = renderer.aiBgReady;

  const pressedKeys = new Set<string>();

  function getRenderSize(): { width: number; height: number } {
    const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    const width = Math.max(2, Math.floor(window.innerWidth * dpr));
    const height = Math.max(2, Math.floor(window.innerHeight * dpr));
    return { width, height };
  }

  function isNearKiln(): boolean {
    return (
      Math.hypot(playerX - scene.kilnPos[0], playerZ - scene.kilnPos[2]) < 6.4
    );
  }

  function syncHud(): void {
    if (phaseLabel) phaseLabel.textContent = MODE_LABELS[mode];
    if (bgBadge) bgBadge.textContent = bgMode === 'ai' ? '🖼️ AI 原画远景' : '⚡ 纯代码远景';

    for (const btn of bgBtns) {
      btn.classList.toggle('active', btn.dataset.bg === bgMode);
    }
    for (const btn of navBtns) {
      btn.classList.toggle('active', btn.dataset.nav === navMode);
    }
    for (const btn of modeBtns) {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    }

    const activeLm = findLandmarkAt(playerZ);
    for (const btn of viewBtns) {
      const matchId = pinnedView ? pinnedView.id : activeLm.id;
      btn.classList.toggle('active', btn.dataset.view === matchId);
    }

    if (storyText) {
      if (kilnBoost > 0.08 && (activeLm.id === 'kiln' || isNearKiln())) {
        storyText.textContent = '砖窑鼓风添柴！炉火剧烈升温，石板路积雪正化作湿润水光并跃出火星...';
      } else {
        storyText.textContent = activeLm.promptText;
      }
    }
    if (btnInteract) {
      const showBtn = activeLm.canInteract || isNearKiln();
      btnInteract.classList.toggle('hidden', !showBtn);
      btnInteract.textContent =
        kilnBoost > 0.15 ? '🔥 炉火正旺 (E 续柴)' : '🔥 E 添柴旺火';
    }

    if (btnPlay) {
      btnPlay.textContent = isPlaying ? '⏸ 暂停' : '▶ 播放';
    }
    if (timeSlider && document.activeElement !== timeSlider) {
      timeSlider.value = wrapTime(simTime).toFixed(2);
    }
    if (timeReadout) {
      const s = wrapTime(simTime).toFixed(1).padStart(4, '0');
      timeReadout.textContent = `${s}s / 24s`;
    }
  }

  function effectiveCameraWithParallax(): CameraPose {
    return {
      x: cam.x + mousePx * 0.72,
      y: cam.y + mousePy * 0.30,
      z: cam.z,
      targetX: cam.targetX + mousePx * 1.12,
      targetY: cam.targetY + mousePy * 0.44,
      targetZ: cam.targetZ,
    };
  }

  function drawFrame(): void {
    const { width, height } = getRenderSize();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const camPose = effectiveCameraWithParallax();
    renderer.render(
      simTime,
      mode,
      bgMode,
      camPose,
      mousePx,
      mousePy,
      playerX,
      playerZ,
      playerYaw,
      walkSpeed,
      kilnBoost,
      width,
      height,
    );
    window.__aiBgReady = renderer.aiBgReady;
    window.__renderReady = true;
    const activeLm = findLandmarkAt(playerZ);
    window.__promStats = {
      simTime: wrapTime(simTime),
      mode,
      bgMode,
      navMode,
      playerX,
      playerZ,
      camX: camPose.x,
      camY: camPose.y,
      camZ: camPose.z,
      aiBgReady: renderer.aiBgReady,
      kilnBoost,
      activeLandmark: activeLm.id,
    };
    syncHud();
    if (loadingBadge && !loadingBadge.classList.contains('hidden')) {
      loadingBadge.classList.add('hidden');
    }
  }

  function triggerStokeKiln(withSound = true): void {
    kilnBoost = 1.0;
    if (withSound) playStokeKilnSound();
    drawFrame();
  }

  function switchToWalk(): void {
    if (navMode !== 'walk') {
      navMode = 'walk';
    }
    pinnedView = null;
  }

  // Expose deterministic QA hooks
  window.renderAt = (t: number, modeOverride?: SceneMode) => {
    isPlaying = false;
    simTime = wrapTime(t);
    if (modeOverride) mode = modeOverride;
    if (navMode === 'cruise' && !pinnedView) {
      playerZ = cruiseZAtTime(simTime);
      playerX = laneCenterX(playerZ);
    }
    cam = targetCamForView(playerX, playerZ, navMode);
    drawFrame();
  };

  window.setBgMode = (bg: BgMode) => {
    bgMode = bg;
    drawFrame();
  };

  window.setCameraView = (view: LandmarkInfo['id'] | 'cruise') => {
    if (view === 'cruise') {
      navMode = 'cruise';
      pinnedView = null;
      playerZ = cruiseZAtTime(simTime);
      playerX = laneCenterX(playerZ);
    } else {
      const lm = LANDMARKS.find((l) => l.id === view);
      if (lm) {
        navMode = 'walk';
        pinnedView = lm;
        playerZ = lm.playerZ;
        playerX = laneCenterX(playerZ);
        playerYaw = Math.PI;
        walkSpeed = 0;
        clickTarget = null;
      }
    }
    cam = targetCamForView(playerX, playerZ, navMode);
    drawFrame();
  };

  window.setPlayerPos = (x: number, z: number) => {
    navMode = 'walk';
    pinnedView = null;
    clickTarget = null;
    playerZ = clamp(z, -23.5, 21.5);
    const cx = laneCenterX(playerZ);
    playerX = clamp(x, cx - 2.1, cx + 2.1);
    playerYaw = Math.PI;
    cam = targetCamForView(playerX, playerZ, 'walk');
    drawFrame();
  };

  window.stokeKiln = () => {
    triggerStokeKiln(false);
  };

  // Wire UI buttons
  for (const btn of bgBtns) {
    btn.addEventListener('click', () => {
      bgMode = btn.dataset.bg === 'proc' ? 'proc' : 'ai';
      drawFrame();
    });
  }

  for (const btn of navBtns) {
    btn.addEventListener('click', () => {
      const next: NavMode = btn.dataset.nav === 'walk' ? 'walk' : 'cruise';
      navMode = next;
      if (next === 'cruise') {
        pinnedView = null;
        clickTarget = null;
        isPlaying = true;
      }
      drawFrame();
    });
  }

  for (const btn of modeBtns) {
    btn.addEventListener('click', () => {
      const m = btn.dataset.mode as SceneMode;
      if (m === 'dusk' || m === 'eclipse' || m === 'morning' || m === 'night') {
        mode = m;
        if (m === 'eclipse' && !isPlaying && Math.abs(wrapTime(simTime) - 11.5) > 8) {
          simTime = 11.5;
        }
        drawFrame();
      }
    });
  }

  for (const btn of viewBtns) {
    btn.addEventListener('click', () => {
      const id = btn.dataset.view as LandmarkInfo['id'];
      const lm = LANDMARKS.find((l) => l.id === id);
      if (lm) {
        navMode = 'walk';
        pinnedView = lm;
        playerZ = lm.playerZ;
        playerX = laneCenterX(playerZ);
        playerYaw = Math.PI;
        clickTarget = null;
        walkSpeed = 0;
        cam = targetCamForView(playerX, playerZ, navMode);
        drawFrame();
      }
    });
  }

  btnPlay?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    syncHud();
  });

  btnInteract?.addEventListener('click', () => {
    triggerStokeKiln(true);
  });

  timeSlider?.addEventListener('input', () => {
    isPlaying = false;
    simTime = wrapTime(Number(timeSlider.value) || 0);
    if (navMode === 'cruise') {
      playerZ = cruiseZAtTime(simTime);
      playerX = laneCenterX(playerZ);
      cam = targetCamForView(playerX, playerZ, 'cruise');
    }
    drawFrame();
  });

  // Keyboard depth navigation + Space play/pause + E interact
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const c = e.code;
    if (
      k === 'w' || k === 'a' || k === 's' || k === 'd' ||
      c === 'KeyW' || c === 'KeyA' || c === 'KeyS' || c === 'KeyD' ||
      k === 'arrowup' || k === 'arrowdown' || k === 'arrowleft' || k === 'arrowright'
    ) {
      pressedKeys.add(c.startsWith('Key') ? c.slice(3).toLowerCase() : k);
      clickTarget = null;
      switchToWalk();
    } else if (k === 'e' || c === 'KeyE') {
      if (isNearKiln()) {
        triggerStokeKiln(true);
      }
    } else if (c === 'Space' && document.activeElement?.tagName !== 'BUTTON') {
      e.preventDefault();
      isPlaying = !isPlaying;
      syncHud();
    }
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    const c = e.code;
    pressedKeys.delete(k);
    if (c.startsWith('Key')) pressedKeys.delete(c.slice(3).toLowerCase());
  });

  // Mouse parallax + click-to-walk on cobblestone lane
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const ny = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    targetMousePx = clamp(nx, -1, 1);
    targetMousePy = clamp(ny, -1, 1);
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const hit = renderer.screenToWalkPoint(
      e.clientX,
      e.clientY,
      rect,
      effectiveCameraWithParallax(),
    );
    if (hit) {
      switchToWalk();
      const hz = clamp(hit.z, -23.5, 21.5);
      const cx = laneCenterX(hz);
      clickTarget = {
        x: clamp(hit.x, cx - 2.1, cx + 2.1),
        z: hz,
      };
    }
  });

  window.addEventListener('resize', () => {
    drawFrame();
  });

  drawFrame();

  let lastNow = performance.now();
  function tick(now: number): void {
    const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;

    mousePx += (targetMousePx - mousePx) * (1 - Math.exp(-dt * 6.0));
    mousePy += (targetMousePy - mousePy) * (1 - Math.exp(-dt * 6.0));

    if (kilnBoost > 0) {
      kilnBoost = Math.max(0, kilnBoost - dt / 4.2);
    }

    if (isPlaying) {
      simTime = wrapTime(simTime + dt * 0.72);
    }

    let moveX = 0;
    let moveZ = 0;
    if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) moveX -= 1;
    if (pressedKeys.has('d') || pressedKeys.has('arrowright')) moveX += 1;
    if (pressedKeys.has('w') || pressedKeys.has('arrowup')) moveZ -= 1;
    if (pressedKeys.has('s') || pressedKeys.has('arrowdown')) moveZ += 1;

    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.hypot(moveX, moveZ) || 1;
      const vx = (moveX / len) * 3.4;
      const vz = (moveZ / len) * 4.4;
      playerZ = clamp(playerZ + vz * dt, -23.5, 21.5);
      const cx = laneCenterX(playerZ);
      playerX = clamp(playerX + vx * dt, cx - 2.1, cx + 2.1);
      playerYaw = Math.atan2(vx, vz);
      walkSpeed = Math.hypot(vx, vz);
    } else if (clickTarget) {
      const dx = clickTarget.x - playerX;
      const dz = clickTarget.z - playerZ;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.16) {
        clickTarget = null;
        walkSpeed = 0;
      } else {
        const speed = 3.9;
        const vx = (dx / dist) * speed;
        const vz = (dz / dist) * speed;
        playerZ = clamp(playerZ + vz * dt, -23.5, 21.5);
        const cx = laneCenterX(playerZ);
        playerX = clamp(playerX + vx * dt, cx - 2.1, cx + 2.1);
        playerYaw = Math.atan2(vx, vz);
        walkSpeed = speed;
      }
    } else if (navMode === 'cruise' && isPlaying) {
      const prevZ = playerZ;
      const prevX = playerX;
      playerZ = cruiseZAtTime(simTime);
      playerX = laneCenterX(playerZ);
      const dx = playerX - prevX;
      const dz = playerZ - prevZ;
      walkSpeed = Math.hypot(dx, dz) / dt;
      if (Math.hypot(dx, dz) > 1e-4) {
        playerYaw = Math.atan2(dx, dz);
      }
    } else {
      walkSpeed = 0;
    }

    if (navMode === 'walk' && walkSpeed > 0.3) {
      stepCooldown -= dt;
      if (stepCooldown <= 0) {
        playFootstepSound();
        stepCooldown = 0.36;
      }
    } else {
      stepCooldown = Math.min(stepCooldown, 0.12);
    }

    const goalCam = targetCamForView(playerX, playerZ, navMode);
    const camLerp = 1 - Math.exp(-dt * (navMode === 'cruise' ? 3.2 : 5.2));
    cam.x += (goalCam.x - cam.x) * camLerp;
    cam.y += (goalCam.y - cam.y) * camLerp;
    cam.z += (goalCam.z - cam.z) * camLerp;
    cam.targetX += (goalCam.targetX - cam.targetX) * camLerp;
    cam.targetY += (goalCam.targetY - cam.targetY) * camLerp;
    cam.targetZ += (goalCam.targetZ - cam.targetZ) * camLerp;

    drawFrame();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

bootstrap();
