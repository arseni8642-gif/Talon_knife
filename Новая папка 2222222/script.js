/* ============================================================
   TALON / 3D EXPLORER
   UI-логика, видеоплеер и интерактивный Three.js-просмотрщик
   ============================================================ */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

document.documentElement.classList.add('js');

/* ------------------------------------------------------------------
   1. Базовые элементы интерфейса
   ------------------------------------------------------------------ */

const yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* Плавное появление блоков при прокрутке */
const revealItems = $$('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  revealItems.forEach((el) => revealObserver.observe(el));
}

/* Мобильное меню */
const navToggle = $('#navToggle');
const siteNav = $('#siteNav');

function closeNav() {
  if (!siteNav || !navToggle) return;
  siteNav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Открыть меню');
}

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  $$('a', siteNav).forEach((link) => link.addEventListener('click', closeNav));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  document.addEventListener('click', (event) => {
    if (!siteNav.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeNav();
  });
}

/* Подсветка активного раздела в навигации */
const navLinks = $$('.site-nav a');
const sections = navLinks
  .map((link) => $(link.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && sections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  sections.forEach((section) => navObserver.observe(section));
}

/* ------------------------------------------------------------------
   2. Адаптивный видеоплеер
   ------------------------------------------------------------------ */

const video = $('#renderVideo');
const videoFallback = $('#videoFallback');

function createPoster() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#17171d"/>
        <stop offset="1" stop-color="#08080c"/>
      </linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f5f8fc"/>
        <stop offset="0.45" stop-color="#8995a6"/>
        <stop offset="0.75" stop-color="#d5deea"/>
        <stop offset="1" stop-color="#515966"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#e03131" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#e03131" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <circle cx="640" cy="360" r="430" fill="url(#glow)"/>
    <g stroke="#ffffff" stroke-opacity="0.045" stroke-width="1">
      <path d="M0 120H1280M0 240H1280M0 360H1280M0 480H1280M0 600H1280"/>
      <path d="M160 0V720M320 0V720M480 0V720M640 0V720M800 0V720M960 0V720M1120 0V720"/>
    </g>
    <g transform="translate(390 168) rotate(-12)">
      <path d="M120 372 C176 176 350 74 590 104 C442 142 318 248 254 380 Z" fill="url(#metal)" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3"/>
      <path d="M144 358 C212 198 356 118 520 110" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="5"/>
      <path d="M18 354 L132 340 L152 410 L36 426 Z" fill="#e7dcc4" stroke="#fff4dd" stroke-opacity="0.45" stroke-width="3"/>
      <circle cx="38" cy="388" r="30" fill="none" stroke="#d9c9a5" stroke-width="14"/>
      <circle cx="92" cy="375" r="8" fill="#8e826d"/>
      <circle cx="124" cy="371" r="8" fill="#8e826d"/>
      <path d="M26 357 L135 344" stroke="#e03131" stroke-width="7" stroke-linecap="round"/>
    </g>
    <text x="72" y="102" fill="#f2f2f5" font-family="Unbounded, Arial" font-size="42" font-weight="700">TALON / SPIN STUDY</text>
    <text x="74" y="142" fill="#e03131" font-family="Inter, Arial" font-size="20" font-weight="600" letter-spacing="5">BLENDER · 1080P · H.264</text>
    <text x="1208" y="660" fill="#9a9aa5" font-family="Inter, Arial" font-size="18" text-anchor="end">animation.mp4</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

if (video) {
  video.poster = createPoster();

  const source = document.createElement('source');
  source.src = 'assets/animation.mp4';
  source.type = 'video/mp4';
  video.appendChild(source);
  video.load();

  const showVideoFallback = () => {
    if (videoFallback) videoFallback.hidden = false;
    video.removeAttribute('poster');
  };

  const showVideoReady = () => {
    if (videoFallback) videoFallback.hidden = true;
  };

  source.addEventListener('error', showVideoFallback);
  video.addEventListener('error', showVideoFallback);
  video.addEventListener('loadedmetadata', showVideoReady);
  video.addEventListener('loadeddata', showVideoReady);
  video.addEventListener('canplay', showVideoReady);
}

/* ------------------------------------------------------------------
   3. Three.js — интерактивный 3D-просмотрщик
   ------------------------------------------------------------------ */

const viewerMount = $('#scene');
const viewerStage = $('#viewerStage');
const loaderEl = $('#loader');
const progressBar = $('#progressBar');
const statusEl = $('#viewerStatus');
const hintEl = $('#viewerHint');
const resetBtn = $('#resetView');
const specSource = $('#specSource');
const specPolys = $('#specPolys');
const specMats = $('#specMats');

let resetViewer = () => {};

function showStatus(message, kind = 'ok', lifetime = 0) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.kind = kind;
  statusEl.classList.add('is-visible');
  if (lifetime) {
    window.setTimeout(() => statusEl.classList.remove('is-visible'), lifetime);
  }
}

function hideLoader() {
  if (loaderEl) loaderEl.classList.add('is-hidden');
}

async function initViewer() {
  if (!viewerMount) return;

  try {
    const THREE = await import('three');
    const [{ GLTFLoader }, { OrbitControls }, { RoomEnvironment }] = await Promise.all([
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/environments/RoomEnvironment.js')
    ]);

    /* --- Рендерер и сцена --- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewerMount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const cameraStart = new THREE.Vector3(0, 0.5, 5.2);
    camera.position.copy(cameraStart);

    /* Студийное HDRI-окружение без внешнего файла */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    if (typeof room.dispose === 'function') room.dispose();
    pmrem.dispose();

    /* --- Свет --- */
    const hemi = new THREE.HemisphereLight(0xbfd2ff, 0x201015, 1.15);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 3.1);
    key.position.set(3.2, 4.4, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 15;
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 3;
    key.shadow.camera.bottom = -3;
    key.shadow.bias = -0.0005;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xe03131, 2.6);
    rim.position.set(-4.2, 1.4, -3.4);
    scene.add(rim);

    const fill = new THREE.PointLight(0x8fa8ff, 22, 12, 2);
    fill.position.set(-1.8, -2.2, 2.6);
    scene.add(fill);

    /* --- Управление --- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 2.2;
    controls.maxDistance = 8;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.maxPolarAngle = Math.PI * 0.88;
    controls.target.set(0, 0, 0);
    controls.update();

    const modelRoot = new THREE.Group();
    modelRoot.rotation.y = -0.35;
    scene.add(modelRoot);

    let autoRotate = true;
    let viewerVisible = true;

    function stopAutoRotate() {
      if (!autoRotate) return;
      autoRotate = false;
      if (hintEl) {
        hintEl.textContent = 'Автовращение остановлено · осмотрите клинок';
        hintEl.classList.add('is-static');
      }
    }

    controls.addEventListener('start', stopAutoRotate);
    viewerMount.addEventListener('pointerdown', stopAutoRotate, { passive: true });
    viewerMount.addEventListener('wheel', stopAutoRotate, { passive: true });
    viewerMount.addEventListener('touchstart', stopAutoRotate, { passive: true });

    resetViewer = () => {
      autoRotate = true;
      modelRoot.rotation.set(0, -0.35, 0);
      camera.position.copy(cameraStart);
      controls.target.set(0, 0, 0);
      controls.update();
      if (hintEl) {
        hintEl.textContent = 'Перетащите, чтобы осмотреть · колесо — зум';
        hintEl.classList.remove('is-static');
      }
    };

    if (resetBtn) resetBtn.addEventListener('click', resetViewer);

    /* --- Автоцентровка и масштабирование модели --- */
    function frameObject(object, targetSize = 2.7) {
      const box = new THREE.Box3().setFromObject(object);
      if (box.isEmpty()) return;

      const size = box.getSize(new THREE.Vector3());
      const maxSide = Math.max(size.x, size.y, size.z) || 1;
      object.scale.multiplyScalar(targetSize / maxSide);

      box.setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
    }

    function updateSpecs(root) {
      let triangles = 0;
      const materials = new Set();

      root.traverse((object) => {
        if (!object.isMesh) return;
        const geometry = object.geometry;
        if (geometry) {
          const count = geometry.index
            ? geometry.index.count
            : (geometry.attributes.position ? geometry.attributes.position.count : 0);
          triangles += count / 3;
        }
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach((material) => {
          if (material && material.uuid) materials.add(material.uuid);
        });
      });

      if (specPolys) specPolys.textContent = Math.round(triangles).toLocaleString('ru-RU');
      if (specMats) specMats.textContent = String(materials.size || '—');
    }

    function prepareObject(root) {
      root.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = true;
          if (object.material) {
            const list = Array.isArray(object.material) ? object.material : [object.material];
            list.forEach((material) => {
              if ('envMapIntensity' in material) material.envMapIntensity = 1.25;
            });
          }
        }
      });
    }

    /* --- Процедурная заглушка, если assets/talon.glb отсутствует --- */
    function buildProceduralTalon() {
      const knife = new THREE.Group();

      const steel = new THREE.MeshStandardMaterial({
        color: 0xaab4c2, metalness: 1, roughness: 0.26, envMapIntensity: 1.5
      });
      const brightSteel = new THREE.MeshStandardMaterial({
        color: 0xe6edf6, metalness: 1, roughness: 0.13, envMapIntensity: 1.7
      });
      const bone = new THREE.MeshStandardMaterial({
        color: 0xe4d6b6, metalness: 0.04, roughness: 0.52
      });
      const crimson = new THREE.MeshStandardMaterial({
        color: 0xe03131, metalness: 0.35, roughness: 0.34,
        emissive: 0x4a0b0b, emissiveIntensity: 0.45
      });

      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-0.85, -0.18);
      bladeShape.bezierCurveTo(-0.42, 0.64, 0.34, 1.04, 1.3, 0.72);
      bladeShape.quadraticCurveTo(0.34, 0.44, -0.12, -0.34);
      bladeShape.lineTo(-0.85, -0.18);

      const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.06,
        bevelEnabled: true,
        bevelThickness: 0.018,
        bevelSize: 0.018,
        bevelSegments: 3,
        curveSegments: 26,
        steps: 1
      });
      const blade = new THREE.Mesh(bladeGeometry, steel);
      blade.position.z = -0.03;
      knife.add(blade);

      const edgeShape = new THREE.Shape();
      edgeShape.moveTo(-0.12, -0.34);
      edgeShape.quadraticCurveTo(0.34, 0.44, 1.3, 0.72);
      edgeShape.quadraticCurveTo(0.36, 0.36, -0.05, -0.28);
      edgeShape.lineTo(-0.12, -0.34);
      const edge = new THREE.Mesh(
        new THREE.ExtrudeGeometry(edgeShape, { depth: 0.022, bevelEnabled: false, curveSegments: 24 }),
        brightSteel
      );
      edge.position.z = 0.011;
      knife.add(edge);

      const handle = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.34, 0.29), bone);
      handle.position.set(-1.18, -0.42, 0);
      handle.rotation.z = -0.1;
      knife.add(handle);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.052, 14, 40), steel);
      ring.position.set(-1.72, -0.47, 0);
      knife.add(ring);

      [-1.36, -1.06, -0.76].forEach((x) => {
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.31, 16), steel);
        pin.rotation.x = Math.PI / 2;
        pin.position.set(x, -0.42, 0);
        knife.add(pin);
      });

      const accent = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.035, 0.3), crimson);
      accent.position.set(-1.19, -0.28, 0);
      accent.rotation.z = -0.1;
      knife.add(accent);

      [[0.08, 0.54], [0.32, 0.7], [0.56, 0.79], [0.8, 0.8]].forEach(([x, y]) => {
        const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.095, 0.075), steel);
        tooth.position.set(x, y, 0);
        tooth.rotation.z = -0.38;
        knife.add(tooth);
      });

      prepareObject(knife);
      frameObject(knife);
      modelRoot.add(knife);
      updateSpecs(knife);
    }

    /* --- Загрузка glTF / GLB --- */
    const loader = new GLTFLoader();

    loader.load(
      'assets/talon.glb',
      (gltf) => {
        try {
          const model = gltf.scene || gltf.scenes[0];
          if (!model) throw new Error('В GLB не найдена сцена');

          // Исходный .blend ориентирован так, что после конвертации в glTF
          // плоскость клинка смотрит вдоль оси X. Поворачиваем модель плашкой к камере.
          model.rotation.y = -Math.PI / 2;
          model.rotation.z = 0.05;

          prepareObject(model);
          frameObject(model);
          modelRoot.add(model);
          updateSpecs(model);
          hideLoader();
          showStatus('Модель assets/talon.glb загружена', 'ok', 3200);
        } catch (error) {
          console.error(error);
          hideLoader();
          buildProceduralTalon();
          if (specSource) specSource.textContent = 'PROC';
          showStatus('Не удалось подготовить GLB — показана процедурная модель.', 'warn');
        }
      },
      (event) => {
        if (!progressBar) return;
        let percent = 8;
        if (event.lengthComputable && event.total > 0) {
          percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
        } else {
          percent = Math.min(92, 8 + Math.round(event.loaded / 1200));
        }
        progressBar.style.width = `${Math.max(8, percent)}%`;
      },
      () => {
        hideLoader();
        buildProceduralTalon();
        if (specSource) specSource.textContent = 'PROC';
        showStatus('Файл assets/talon.glb не найден — показана процедурная модель.', 'warn');
      }
    );

    /* --- Размеры и цикл рендера --- */
    function resize() {
      const width = Math.max(1, viewerMount.clientWidth);
      const height = Math.max(1, viewerMount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(viewerMount);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    if ('IntersectionObserver' in window && viewerStage) {
      new IntersectionObserver((entries) => {
        viewerVisible = entries[0].isIntersecting;
      }, { threshold: 0.01 }).observe(viewerStage);
    }

    const clock = new THREE.Clock();

    function renderLoop() {
      window.requestAnimationFrame(renderLoop);
      if (document.hidden || !viewerVisible) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      if (autoRotate) modelRoot.rotation.y += delta * 0.3;
      controls.update();
      renderer.render(scene, camera);
    }

    renderLoop();
  } catch (error) {
    console.error('Three.js viewer error:', error);
    hideLoader();
    showStatus('3D-просмотрщик недоступен: не удалось загрузить Three.js с CDN. Остальной контент страницы работает.', 'error');
    if (hintEl) {
      hintEl.textContent = 'Для работы 3D нужен доступ к CDN';
      hintEl.classList.add('is-static');
    }
  }
}

initViewer();
