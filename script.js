// =======================
// Elements
// =======================
const video       = document.getElementById('video');
const canvas      = document.getElementById('canvas');
const startBtn    = document.getElementById('startCamera');
const captureBtn  = document.getElementById('capture');
const retakeBtn   = document.getElementById('retake');
const downloadBtn = document.getElementById('download');
const cameraDiv   = document.getElementById('cameraSection');
const photoDiv    = document.getElementById('photoSection');
const logo        = document.getElementById('hotelLogo');
const themeItems  = document.querySelectorAll('.theme-item');

const subtitleEl   = document.getElementById('subtitle');
const footerEl     = document.getElementById('footerText');
const bgTitleLeft  = document.getElementById('bgTitleLeft');
const bgTitleRight = document.getElementById('bgTitleRight');
const langLabel    = document.getElementById('langLabel');
const langSelect   = document.getElementById('langSelect');

// QR elements
const qrPanel  = document.getElementById('qrPanel');
const qrCanvas = document.getElementById('qrCanvas');
const qrTitle  = document.getElementById('qrTitle');
const qrHint   = document.getElementById('qrHint');

let stream = null;
let currentTheme = 'bg_vue';
let lastBlobUrl = null;

logo.loading = 'eager';

// =======================
// I18N (FR / EN / AR)
// =======================
const I18N = {
  en: {
    dir: "ltr",
    language: "Language",
    subtitle: "Capture Your Moment",
    backgrounds: "Backgrounds",
    footer: "Smile, your Marhaba Palace memory is ready.",
    start: "Start Camera",
    take: "Take Photo",
    download: "Download",
    retake: "Retake",
    qrTitle: "Scan to download on your phone",
    qrHint: "Open your camera and scan the QR.",
    themes: {
      theme_seaview: "Sea View",
      theme_christmas: "Christmas",
      theme_birthday: "Birthday",
      theme_luxury: "Luxury",
      theme_beach: "Beach",
      theme_romantic: "Romantic",
    },
    photoText: {
      "bg_vue": "Marhaba Palace – Summer 2025",
      "bg-noel": "Merry Christmas from Marhaba Palace",
      "bg-anniversaire": "Happy Birthday at Marhaba Palace",
      "bg-romantique": "Love is in the air – Marhaba Palace",
      "bg-luxe": "Luxury moments at Marhaba Palace",
      "bg-plage": "Sunny days at Marhaba Palace",
    }
  },
  fr: {
    dir: "ltr",
    language: "Langue",
    subtitle: "Capture ton moment",
    backgrounds: "Décors",
    footer: "Souriez, votre souvenir Marhaba Palace est prêt.",
    start: "Démarrer la caméra",
    take: "Prendre une photo",
    download: "Télécharger",
    retake: "Refaire",
    qrTitle: "Scannez pour télécharger sur votre téléphone",
    qrHint: "Ouvrez l’appareil photo et scannez le QR.",
    themes: {
      theme_seaview: "Vue mer",
      theme_christmas: "Noël",
      theme_birthday: "Anniversaire",
      theme_luxury: "Luxe",
      theme_beach: "Plage",
      theme_romantic: "Romantique",
    },
    photoText: {
      "bg_vue": "Marhaba Palace – Été 2025",
      "bg-noel": "Joyeux Noël – Marhaba Palace",
      "bg-anniversaire": "Joyeux anniversaire – Marhaba Palace",
      "bg-romantique": "L’amour est dans l’air – Marhaba Palace",
      "bg-luxe": "Moments de luxe – Marhaba Palace",
      "bg-plage": "Journées ensoleillées – Marhaba Palace",
    }
  },
  ar: {
    dir: "rtl",
    language: "اللغة",
    subtitle: "التقط لحظتك",
    backgrounds: "الخلفيات",
    footer: "ابتسم، تذكـارك من مرحبـا بالاس جاهز.",
    start: "تشغيل الكاميرا",
    take: "التقاط صورة",
    download: "تحميل",
    retake: "إعادة",
    qrTitle: "امسح لتحميل الصورة على هاتفك",
    qrHint: "افتح الكاميرا وامسح رمز QR.",
    themes: {
      theme_seaview: "إطلالة البحر",
      theme_christmas: "الكريسماس",
      theme_birthday: "عيد ميلاد",
      theme_luxury: "فخامة",
      theme_beach: "الشاطئ",
      theme_romantic: "رومانسي",
    },
    photoText: {
      "bg_vue": "مرحبـا بالاس – صيف 2025",
      "bg-noel": "ميلاد مجيد – مرحبا بالاس",
      "bg-anniversaire": "عيد ميلاد سعيد – مرحبا بالاس",
      "bg-romantique": "الحب في الأجواء – مرحبا بالاس",
      "bg-luxe": "لحظات فاخرة – مرحبا بالاس",
      "bg-plage": "أيام مشمسة – مرحبا بالاس",
    }
  }
};

let currentLang = (langSelect && langSelect.value) ? langSelect.value : "en";
function t(){ return I18N[currentLang] || I18N.en; }

function applyLanguage(lang){
  currentLang = lang;
  const L = t();

  document.documentElement.lang = lang;
  document.documentElement.dir  = L.dir;

  if (langLabel) langLabel.textContent = L.language;
  if (subtitleEl) subtitleEl.textContent = L.subtitle;
  if (bgTitleLeft) bgTitleLeft.textContent = L.backgrounds;
  if (bgTitleRight) bgTitleRight.textContent = L.backgrounds;
  if (footerEl) footerEl.textContent = L.footer;

  startBtn.textContent = L.start;
  captureBtn.textContent = L.take;
  downloadBtn.textContent = L.download;
  retakeBtn.textContent = L.retake;

  if (qrTitle) qrTitle.textContent = L.qrTitle;
  if (qrHint) qrHint.textContent = L.qrHint;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (L.themes[key]) el.textContent = L.themes[key];
  });
}

if (langSelect) langSelect.addEventListener("change", () => applyLanguage(langSelect.value));
applyLanguage(currentLang);

// =======================
// Themes
// =======================
themeItems.forEach(item => {
  if (item.dataset.theme === currentTheme) item.classList.add('selected');
});
themeItems.forEach(item => {
  item.addEventListener('click', () => {
    themeItems.forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    currentTheme = item.dataset.theme;
  });
});

// =======================
// MediaPipe Segmentation
// =======================
let selfieSeg = null;
let segReady = false;
let segResult = null;

function initSegmentation(){
  if (selfieSeg) return;

  selfieSeg = new SelfieSegmentation({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
  });

  selfieSeg.setOptions({
    modelSelection: 1,
    selfieMode: true
  });

  selfieSeg.onResults((res) => {
    segResult = res;
    segReady = true;
  });
}
initSegmentation();

// =======================
// Camera start (HD + best effort cleanup)
// =======================
startBtn.addEventListener('click', async () => {
  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width:  { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30, max: 30 }
      },
      audio: false
    });

    video.srcObject = stream;

    await new Promise(resolve => {
      if (video.readyState >= 1) return resolve();
      video.onloadedmetadata = () => resolve();
    });

    // Try constraints (depends on device/browser)
    const track = stream.getVideoTracks()[0];
    if (track && track.applyConstraints){
      try{
        await track.applyConstraints({
          advanced: [
            { noiseSuppression: true },
            { autoExposureMode: "continuous" },
            { whiteBalanceMode: "continuous" }
          ]
        });
      }catch(_){}
    }

    captureBtn.disabled = false;
    startBtn.disabled = true;
  } catch(e){
    alert('Camera error: ' + e.message);
  }
});

// =======================
// Capture (PRO background removal + logo + caption + QR)
// =======================
captureBtn.addEventListener('click', async () => {
  if (!stream) { alert('Camera is not started.'); return; }

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) { alert('Video not ready yet. Try again.'); return; }

  canvas.width  = vw;
  canvas.height = vh;

  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Load background image
  const bgImage = new Image();
  bgImage.decoding = 'async';
  bgImage.src = `backgrounds/${currentTheme}.jpg`;

  bgImage.onload = async () => {
    // 1) Draw background full
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // 2) Run segmentation once (current frame)
    segReady = false;
    segResult = null;

    try{
      await selfieSeg.send({ image: video });
    }catch(e){
      alert("Segmentation error: " + e.message);
      return;
    }

    await waitForSegmentation(1500);

    // 3) Person area inside rounded frame
    const margin = Math.round(canvas.width * 0.07);
    const personW = canvas.width  - margin * 2;
    const personH = canvas.height - margin * 2;
    const radius  = Math.round(canvas.width * 0.04);

    ctx.save();
    ctx.beginPath();
    roundedRect(ctx, margin, margin, personW, personH, radius);
    ctx.clip();

    if (!segResult || !segResult.segmentationMask){
      // fallback: normal video
      ctx.drawImage(video, margin, margin, personW, personH);
    } else {
      const cutout = buildProCutout(segResult.image, segResult.segmentationMask, personW, personH);

      // Shadow behind person (natural)
      drawSoftShadow(ctx, cutout.maskFeathered, margin, margin, personW, personH);

      // Draw person (polish w/ filter - no getImageData)
      ctx.save();
      ctx.filter = "contrast(1.04) saturate(1.04)";
      ctx.drawImage(cutout.person, margin, margin, personW, personH);
      ctx.restore();
    }

    ctx.restore();

    // 4) Logo top-right of FULL canvas (high quality)
    try { await ensureImageLoaded(logo); } catch(_){}
    if (logo.naturalWidth > 0){
      drawLogoTopRight(ctx, canvas, logo);
    }

    // 5) Caption bottom
    const L = t();
    const caption = (L.photoText && L.photoText[currentTheme]) ? L.photoText[currentTheme] : "Marhaba Palace";
    drawBottomCaption(ctx, canvas, caption);

    // 6) Show final
    cameraDiv.style.display = 'none';
    photoDiv.style.display  = 'flex';
    retakeBtn.style.display = 'inline-flex';
    downloadBtn.style.display = 'inline-flex';

    // 7) Export blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Local download (PC)
      if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
      lastBlobUrl = URL.createObjectURL(blob);

      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = lastBlobUrl;
        a.download = `marhaba_palace_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      };

      // QR for phone download (needs server.js running)
      try{
        const url = await uploadAndGetUrl(blob);
        await generateQR(url);
        if (qrPanel) qrPanel.style.display = 'block';
      }catch(_err){
        if (qrPanel) qrPanel.style.display = 'block';
        const msg = (currentLang === "fr")
          ? "QR indisponible (serveur non lancé)"
          : (currentLang === "ar")
            ? "رمز QR غير متاح (الخادم غير شغّال)"
            : "QR unavailable (server not running)";
        const hint = (currentLang === "fr")
          ? "Lance server.js puis recharge la page."
          : (currentLang === "ar")
            ? "شغّل server.js ثم أعد تحميل الصفحة."
            : "Run server.js then reload the page.";
        if (qrTitle) qrTitle.textContent = msg;
        if (qrHint) qrHint.textContent = hint;
        clearQR();
      }
    }, 'image/png');

  };

  bgImage.onerror = () => alert('Cannot load background image: ' + bgImage.src);
});

// =======================
// Retake
// =======================
retakeBtn.addEventListener('click', () => {
  photoDiv.style.display  = 'none';
  cameraDiv.style.display = 'block';
  retakeBtn.style.display = 'none';
  downloadBtn.style.display = 'none';
  if (qrPanel) qrPanel.style.display = 'none';
  clearQR();

  captureBtn.disabled = !stream;
  if (stream) video.srcObject = stream;
});

// =======================
// PRO CUTOUT (anti-halo)
// =======================
function buildProCutout(image, mask, w, h){
  const maskRaw = document.createElement('canvas');
  maskRaw.width = w; maskRaw.height = h;
  const mctx = maskRaw.getContext('2d');
  mctx.imageSmoothingEnabled = true;
  mctx.imageSmoothingQuality = 'high';
  mctx.drawImage(mask, 0, 0, w, h);

  // Dilate
  const maskDilated = document.createElement('canvas');
  maskDilated.width = w; maskDilated.height = h;
  const dctx = maskDilated.getContext('2d');
  dctx.imageSmoothingEnabled = true;
  dctx.imageSmoothingQuality = 'high';

  const dilate = Math.max(2, Math.round(Math.min(w, h) * 0.006));
  dctx.drawImage(maskRaw, -dilate, -dilate, w + dilate*2, h + dilate*2);

  // Feather
  const maskFeathered = document.createElement('canvas');
  maskFeathered.width = w; maskFeathered.height = h;
  const fctx = maskFeathered.getContext('2d');
  fctx.imageSmoothingEnabled = true;
  fctx.imageSmoothingQuality = 'high';

  const blurPx = Math.max(4, Math.round(Math.min(w, h) * 0.012));
  fctx.filter = `blur(${blurPx}px)`;
  fctx.drawImage(maskDilated, 0, 0, w, h);
  fctx.filter = 'none';

  // Person
  const person = document.createElement('canvas');
  person.width = w; person.height = h;
  const pctx = person.getContext('2d');
  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = 'high';

  pctx.drawImage(image, 0, 0, w, h);
  pctx.globalCompositeOperation = 'destination-in';
  pctx.drawImage(maskFeathered, 0, 0, w, h);
  pctx.globalCompositeOperation = 'source-over';

  // Edge clean trick
  const shrink = Math.max(1, Math.round(Math.min(w, h) * 0.004));
  pctx.globalAlpha = 0.22;
  pctx.drawImage(person, shrink, shrink, w - shrink*2, h - shrink*2);
  pctx.globalAlpha = 1;

  return { person, maskFeathered };
}

function drawSoftShadow(ctx, featheredMaskCanvas, x, y, w, h){
  const sh = document.createElement('canvas');
  sh.width = w; sh.height = h;
  const shctx = sh.getContext('2d');
  shctx.drawImage(featheredMaskCanvas, 0, 0, w, h);
  shctx.globalCompositeOperation = 'source-in';
  shctx.fillStyle = 'rgba(0,0,0,0.32)';
  shctx.fillRect(0, 0, w, h);

  const blur = Math.max(10, Math.round(Math.min(w, h) * 0.03));
  const ox = Math.round(w * 0.01);
  const oy = Math.round(h * 0.02);

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(sh, x + ox, y + oy, w, h);
  ctx.filter = 'none';
  ctx.restore();
}

// =======================
// Logo high quality TOP RIGHT
// =======================
function drawLogoTopRight(ctx, canvasEl, logoImg){
  const W = canvasEl.width;
  const H = canvasEl.height;

  const targetW = Math.round(W * 0.16); // visible
  const ratio = logoImg.naturalHeight / logoImg.naturalWidth;
  const targetH = Math.round(targetW * ratio);

  const pad = Math.round(W * 0.035);
  const x = W - targetW - pad;
  const y = pad;

  const platePad = Math.round(W * 0.012);
  const bgX = x - platePad;
  const bgY = y - platePad;
  const bgW = targetW + platePad * 2;
  const bgH = targetH + platePad * 2;
  const r   = Math.round(W * 0.018);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = 'rgba(2, 6, 23, 0.62)';
  roundRectFill(ctx, bgX, bgY, bgW, bgH, r);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = Math.max(2, Math.round(W * 0.002));
  roundRectStroke(ctx, bgX, bgY, bgW, bgH, r);

  ctx.drawImage(logoImg, x, y, targetW, targetH);
  ctx.restore();
}

function roundRectFill(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
function roundRectStroke(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

// =======================
// Caption
// =======================
function drawBottomCaption(ctx, canvasEl, text){
  const w = canvasEl.width;
  const h = canvasEl.height;
  const bandH = Math.round(h * 0.085);
  const padX  = Math.round(w * 0.05);

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, h - bandH, w, bandH);

  const fontSize = Math.max(22, Math.round(w * 0.028));
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontSize}px Georgia, "Times New Roman", serif`;

  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;

  ctx.direction = (t().dir === "rtl") ? "rtl" : "ltr";
  ctx.fillText(text, w/2, h - bandH/2, w - padX*2);
  ctx.restore();
}

// =======================
// Geometry
// =======================
function roundedRect(ctx, x, y, width, height, radius){
  const r = Math.min(radius, width/2, height/2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

// =======================
// Helpers
// =======================
function ensureImageLoaded(img){
  return new Promise((resolve, reject) => {
    if (img.complete && img.naturalWidth > 0) return resolve();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image load error'));
  });
}

function waitForSegmentation(timeoutMs){
  return new Promise((resolve) => {
    const t0 = performance.now();
    const check = () => {
      if (segReady && segResult) return resolve();
      if (performance.now() - t0 > timeoutMs) return resolve();
      requestAnimationFrame(check);
    };
    check();
  });
}

// =======================
// QR upload + generate
// =======================
async function uploadAndGetUrl(blob){
  const fd = new FormData();
  fd.append("file", blob, `marhaba_${Date.now()}.png`);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const json = await res.json();
  if (!json.url) throw new Error("No URL returned");
  return json.url;
}

async function generateQR(url){
  clearQR();
  // QRCode library loaded in index.html
  await QRCode.toCanvas(qrCanvas, url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220
  });
}

function clearQR(){
  if (!qrCanvas) return;
  const c = qrCanvas.getContext("2d");
  c.clearRect(0,0,qrCanvas.width, qrCanvas.height);
}
