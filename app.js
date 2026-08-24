/**
 * WebAR Multi-Building Educational Application Logic
 * Includes Teacher Admin Mode & 3D Surface Pin Position Picker
 */

document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.getElementById('ar-viewer');
  const buildingSelect = document.getElementById('building-select');
  const quizBtn = document.getElementById('quiz-btn');
  const arPromptBtn = document.getElementById('ar-prompt-btn');
  const teacherModeBtn = document.getElementById('teacher-mode-btn');

  // Info Drawer elements
  const infoDrawer = document.getElementById('info-drawer');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerBody = document.getElementById('drawer-body');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const audioPlayBtn = document.getElementById('audio-play-btn');
  const audioStatusText = document.getElementById('audio-status-text');

  // Media Drawer & Lightbox elements
  const drawerMediaContainer = document.getElementById('drawer-media-container');
  const drawerImg = document.getElementById('drawer-img');
  const drawerVideo = document.getElementById('drawer-video');
  const drawerIframe = document.getElementById('drawer-iframe');
  const imageModal = document.getElementById('image-modal');
  const imageModalClose = document.getElementById('image-modal-close');
  const lightboxImg = document.getElementById('lightbox-img');

  // Slideshow Navigation elements & state
  const slideshowPrev = document.getElementById('slideshow-prev');
  const slideshowNext = document.getElementById('slideshow-next');
  const slideshowDots = document.getElementById('slideshow-dots');
  const slideshowCounter = document.getElementById('slideshow-counter');

  let slideshowTimer = null;
  let slideshowImages = [];
  let currentSlideIndex = 0;

  // Quiz Modal elements
  const quizModal = document.getElementById('quiz-modal');
  const quizModalClose = document.getElementById('quiz-modal-close');
  const quizTitle = document.getElementById('quiz-title');
  const quizBody = document.getElementById('quiz-body');

  // Teacher Modal elements
  const teacherModal = document.getElementById('teacher-modal');
  const teacherModalClose = document.getElementById('teacher-modal-close');
  const teacherBldName = document.getElementById('teacher-bld-name');
  const teacherBldSubtitle = document.getElementById('teacher-bld-subtitle');
  const hotspotEditorsContainer = document.getElementById('hotspot-editors-container');
  const saveTeacherDataBtn = document.getElementById('save-teacher-data-btn');
  const resetTeacherDataBtn = document.getElementById('reset-teacher-data-btn');

  // Teacher Tabs & Quiz Creator elements
  const tabBtnContent = document.getElementById('tab-btn-content');
  const tabBtnQuiz = document.getElementById('tab-btn-quiz');
  const paneContent = document.getElementById('pane-content');
  const paneQuiz = document.getElementById('pane-quiz');
  const quizEditorsContainer = document.getElementById('quiz-editors-container');
  const addQuizQBtn = document.getElementById('add-quiz-q-btn');
  const quizCountLabel = document.getElementById('quiz-count-label');
  const exportTeacherDataBtn = document.getElementById('export-teacher-data-btn');
  const importTeacherDataInput = document.getElementById('import-teacher-data-input');

  // Pin Placement Banner
  const pinPlacementBanner = document.getElementById('pin-placement-banner');
  const placingPinLabel = document.getElementById('placing-pin-label');
  const cancelPinPlacementBtn = document.getElementById('cancel-pin-placement-btn');

  // App State
  let currentLanguage = 'en';
  let currentBuildingIndex = 0;
  let currentActiveHotspot = null;
  let isAudioPlaying = false;
  let speechSynthesisUtterance = null;
  let isPickingPinPosition = false;
  let targetHotspotIndexToPlace = null;

  // Tab Switching
  if (tabBtnContent && tabBtnQuiz) {
    tabBtnContent.addEventListener('click', () => {
      tabBtnContent.classList.add('active');
      tabBtnQuiz.classList.remove('active');
      paneContent.classList.add('active');
      paneQuiz.classList.remove('active');
    });

    tabBtnQuiz.addEventListener('click', () => {
      tabBtnQuiz.classList.add('active');
      tabBtnContent.classList.remove('active');
      paneQuiz.classList.add('active');
      paneContent.classList.remove('active');
    });
  }

  // Load Teacher Saved Data from LocalStorage if available (with auto-merge for media assets)
  function loadSavedData() {
    try {
      const defaultBuildings = JSON.parse(JSON.stringify(window.BUILDINGS));
      const saved = localStorage.getItem('webar_teacher_buildings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((bld, bIdx) => {
            const defBld = defaultBuildings[bIdx];
            if (defBld && bld.hotspots) {
              bld.hotspots.forEach((hs, hIdx) => {
                const defHs = defBld.hotspots ? defBld.hotspots[hIdx] : null;
                if (defHs) {
                  if (!hs.mediaType) hs.mediaType = defHs.mediaType || 'image';
                  if (defHs.images && defHs.images.length > 0) {
                    const existing = hs.images || [];
                    const merged = Array.from(new Set([...defHs.images, ...existing]));
                    hs.images = merged;
                    hs.mediaUrl = merged[0] || defHs.mediaUrl || '';
                  }
                }
              });
            }
          });
          window.BUILDINGS = parsed;
        }
      }
    } catch (err) {
      console.warn("LocalStorage load error:", err);
    }
  }

  loadSavedData();

  // Initialize Building Dropdown Options
  function initBuildingOptions() {
    buildingSelect.innerHTML = '';
    window.BUILDINGS.forEach((bld, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = bld.name[currentLanguage];
      buildingSelect.appendChild(opt);
    });
    buildingSelect.value = currentBuildingIndex;
  }

  // Load Selected Building
  function loadBuilding(index) {
    currentBuildingIndex = index;
    const building = window.BUILDINGS[index];

    // Update Header Text
    document.getElementById('building-title').textContent = building.name[currentLanguage];
    document.getElementById('building-subtitle').textContent = building.subtitle[currentLanguage];

    // Load 3D GLB model
    modelViewer.src = building.modelPath;

    renderHotspots();
    closeDrawer();
  }

  // Render Hotspots on 3D Model
  function renderHotspots() {
    const building = window.BUILDINGS[currentBuildingIndex];
    const oldHotspots = modelViewer.querySelectorAll('.hotspot-btn');
    oldHotspots.forEach(hs => hs.remove());

    // Generate Hotspots
    building.hotspots.forEach((hs, hIndex) => {
      const hsBtn = document.createElement('button');
      hsBtn.className = 'hotspot-btn';
      hsBtn.setAttribute('slot', hs.slot || `hotspot-${hIndex}`);
      hsBtn.setAttribute('data-position', hs.position);
      hsBtn.setAttribute('data-normal', hs.normal || '0m 1m 0m');
      hsBtn.textContent = hIndex + 1;

      hsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectHotspot(hs, hsBtn, hIndex);
      });

      modelViewer.appendChild(hsBtn);
    });
  }

  function checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function autoDiscoverPhotosForPin(buildingIdx, hotspotIdx) {
    const bNum = buildingIdx + 1;
    const pNum = hotspotIdx + 1;
    const exts = ['jpeg', 'jpg', 'png', 'webp', 'JPEG', 'JPG', 'PNG'];
    const found = [];

    for (let i = 1; i <= 10; i++) {
      let matched = false;
      for (const ext of exts) {
        const testPath = `assets/b${bNum}_p${pNum}_${i}.${ext}`;
        const exists = await checkImageExists(testPath);
        if (exists) {
          found.push(testPath);
          matched = true;
          break;
        }
      }
      if (!matched && i > 1) {
        break; // stop when sequential numbering stops
      }
    }

    return found;
  }

  function formatDescriptionAsBullets(text) {
    if (!text) return '';
    const trimmed = text.trim();

    let lines = [];
    if (trimmed.includes('\n')) {
      lines = trimmed.split('\n');
    } else if (trimmed.includes('•')) {
      lines = trimmed.split('•');
    } else {
      lines = [trimmed];
    }

    lines = lines.map(l => l.replace(/^[•\-\*\d\.\s]+/, '').trim()).filter(Boolean);

    if (lines.length === 0) return '';

    let html = '<ul class="drawer-bullet-list">';
    lines.forEach(l => {
      html += `<li class="bullet-item"><span class="bullet-dot">•</span><span class="bullet-text">${l}</span></li>`;
    });
    html += '</ul>';
    return html;
  }

  // Select Hotspot & Camera Focus
  async function selectHotspot(hotspot, hsBtnElement, hIndex = 0) {
    if (isPickingPinPosition) return;
    currentActiveHotspot = hotspot;

    // Highlight Active Hotspot
    modelViewer.querySelectorAll('.hotspot-btn').forEach(btn => btn.classList.remove('active'));
    if (hsBtnElement) hsBtnElement.classList.add('active');

    // Orbit camera to hotspot
    modelViewer.cameraTarget = hotspot.position;
    modelViewer.fieldOfView = '35deg';

    // Populate Info Drawer with Bullet Points
    drawerTitle.textContent = hotspot.title[currentLanguage] || hotspot.title.en || '';
    const rawDesc = hotspot.description[currentLanguage] || hotspot.description.en || '';
    drawerBody.innerHTML = formatDescriptionAsBullets(rawDesc);

    // Handle Hotspot Photo / Video Media Display
    resetDrawerMedia();

    const type = hotspot.mediaType || 'image';

    // Auto-discover photos from assets/ folder matching b{building}_p{pin}_{N}.*
    let imgs = [];
    if (type === 'image') {
      const discovered = await autoDiscoverPhotosForPin(currentBuildingIndex, hIndex);
      if (discovered && discovered.length > 0) {
        imgs = discovered;
      }
    }

    if (imgs.length === 0) {
      imgs = (hotspot.images && hotspot.images.length > 0) 
        ? hotspot.images 
        : (hotspot.mediaUrl ? [hotspot.mediaUrl] : []);
    }

    if (type === 'image' && imgs.length > 0) {
      drawerImg.style.display = 'block';
      drawerMediaContainer.style.display = 'flex';
      startSlideshow(imgs);
    } else if (type === 'video' && hotspot.mediaUrl) {
      const url = hotspot.mediaUrl;
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let embedUrl = url;
        if (url.includes('watch?v=')) {
          embedUrl = url.replace('watch?v=', 'embed/');
        } else if (url.includes('youtu.be/')) {
          embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
        }
        drawerIframe.src = embedUrl;
        drawerIframe.style.display = 'block';
      } else {
        drawerVideo.src = url;
        drawerVideo.style.display = 'block';
      }
      drawerMediaContainer.style.display = 'flex';
    }

    infoDrawer.classList.add('open');
    stopAudio();
  }

  // --- AUTOMATIC REPEATING SLIDESHOW ENGINE ---
  function startSlideshow(images) {
    stopSlideshow();
    slideshowImages = images;
    currentSlideIndex = 0;

    if (!images || images.length === 0) return;

    if (images.length > 1) {
      if (slideshowPrev) slideshowPrev.style.display = 'flex';
      if (slideshowNext) slideshowNext.style.display = 'flex';
      if (slideshowCounter) slideshowCounter.style.display = 'block';
      if (slideshowDots) {
        slideshowDots.style.display = 'flex';
        slideshowDots.innerHTML = '';
        images.forEach((_, idx) => {
          const dot = document.createElement('span');
          dot.className = `slideshow-dot ${idx === 0 ? 'active' : ''}`;
          dot.addEventListener('click', () => {
            currentSlideIndex = idx;
            showSlide(currentSlideIndex);
            resetSlideshowTimer();
          });
          slideshowDots.appendChild(dot);
        });
      }
    } else {
      if (slideshowPrev) slideshowPrev.style.display = 'none';
      if (slideshowNext) slideshowNext.style.display = 'none';
      if (slideshowDots) slideshowDots.style.display = 'none';
      if (slideshowCounter) slideshowCounter.style.display = 'none';
    }

    showSlide(0);

    if (images.length > 1) {
      resetSlideshowTimer();
    }
  }

  function resetSlideshowTimer() {
    if (slideshowTimer) clearInterval(slideshowTimer);
    slideshowTimer = setInterval(() => {
      if (slideshowImages && slideshowImages.length > 1) {
        currentSlideIndex = (currentSlideIndex + 1) % slideshowImages.length;
        showSlide(currentSlideIndex);
      }
    }, 3000);
  }

  function parseMediaInputString(str) {
    if (!str) return [];
    const dataUrls = str.match(/data:(image|video)\/[^;]+;base64,[A-Za-z0-9+/=]+/g) || [];
    let remaining = str;
    dataUrls.forEach(d => {
      remaining = remaining.replace(d, '');
    });
    const webUrls = remaining.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map(url => {
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:') && !url.startsWith('assets/')) {
        return 'assets/' + url;
      }
      return url;
    });
    return [...dataUrls, ...webUrls];
  }

  function compressImage(dataUrl, maxDimension = 1200, quality = 0.85) {
    return new Promise((resolve) => {
      if (!dataUrl || !dataUrl.startsWith('data:image')) {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  function convertGoogleDriveUrl(url) {
    if (!url) return url;
    let trimmed = url.trim();
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      let fileId = null;
      const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match1 && match1[1]) {
        fileId = match1[1];
      } else if (match2 && match2[1]) {
        fileId = match2[1];
      }
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
    return trimmed;
  }

  function showSlide(index) {
    if (!slideshowImages || slideshowImages.length === 0) return;
    const rawUrl = slideshowImages[index];
    const url = convertGoogleDriveUrl(rawUrl);
    drawerImg.src = url;
    
    drawerImg.onerror = () => {
      console.warn('Failed to load image from URL:', url);
    };

    drawerImg.classList.remove('fade-in');
    void drawerImg.offsetWidth;
    drawerImg.classList.add('fade-in');

    if (slideshowCounter) {
      slideshowCounter.textContent = `${index + 1} / ${slideshowImages.length}`;
    }

    if (slideshowDots) {
      const dots = slideshowDots.querySelectorAll('.slideshow-dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
    }
  }

  function stopSlideshow() {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }
  }

  if (slideshowPrev) {
    slideshowPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (slideshowImages.length > 1) {
        currentSlideIndex = (currentSlideIndex - 1 + slideshowImages.length) % slideshowImages.length;
        showSlide(currentSlideIndex);
        resetSlideshowTimer();
      }
    });
  }

  if (slideshowNext) {
    slideshowNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (slideshowImages.length > 1) {
        currentSlideIndex = (currentSlideIndex + 1) % slideshowImages.length;
        showSlide(currentSlideIndex);
        resetSlideshowTimer();
      }
    });
  }

  function resetDrawerMedia() {
    stopSlideshow();
    if (drawerVideo) {
      drawerVideo.pause();
      drawerVideo.src = '';
      drawerVideo.style.display = 'none';
    }
    if (drawerIframe) {
      drawerIframe.src = '';
      drawerIframe.style.display = 'none';
    }
    if (drawerImg) {
      drawerImg.style.display = 'none';
    }
    if (slideshowPrev) slideshowPrev.style.display = 'none';
    if (slideshowNext) slideshowNext.style.display = 'none';
    if (slideshowDots) slideshowDots.style.display = 'none';
    if (slideshowCounter) slideshowCounter.style.display = 'none';
    if (drawerMediaContainer) {
      drawerMediaContainer.style.display = 'none';
    }
  }

  // Photo Lightbox View
  if (drawerImg && imageModal && lightboxImg) {
    drawerImg.addEventListener('click', () => {
      if (drawerImg.src) {
        lightboxImg.src = drawerImg.src;
        imageModal.classList.add('active');
      }
    });
  }

  if (imageModalClose) {
    imageModalClose.addEventListener('click', () => {
      imageModal.classList.remove('active');
    });
  }

  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) {
        imageModal.classList.remove('active');
      }
    });
  }

  // Text To Speech Audio Player
  function toggleAudio() {
    if (isAudioPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  }

  function playAudio() {
    if (!currentActiveHotspot) return;
    stopAudio();

    const textToSpeak = currentActiveHotspot.audioText[currentLanguage] || currentActiveHotspot.audioText.en || '';
    speechSynthesisUtterance = new SpeechSynthesisUtterance(textToSpeak);
    speechSynthesisUtterance.lang = 'en-US';
    speechSynthesisUtterance.rate = 0.95;

    speechSynthesisUtterance.onstart = () => {
      isAudioPlaying = true;
      audioPlayBtn.textContent = '⏸️ Stop Audio';
      audioStatusText.textContent = 'Playing narration...';
    };

    speechSynthesisUtterance.onend = stopAudio;
    speechSynthesisUtterance.onerror = stopAudio;

    window.speechSynthesis.speak(speechSynthesisUtterance);
  }

  function stopAudio() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isAudioPlaying = false;
    audioPlayBtn.textContent = '🔊 Listen Guide';
    audioStatusText.textContent = 'Tap to hear narration';
  }

  function closeDrawer() {
    infoDrawer.classList.remove('open');
    modelViewer.querySelectorAll('.hotspot-btn').forEach(btn => btn.classList.remove('active'));
    resetDrawerMedia();
    stopAudio();
  }

  // Quiz Engine
  function openQuiz() {
    const building = window.BUILDINGS[currentBuildingIndex];
    quizTitle.textContent = `${building.name[currentLanguage]} - Knowledge Quiz`;
    
    quizBody.innerHTML = '';

    if (!building.quiz || building.quiz.length === 0) {
      quizBody.innerHTML = `
        <div style="text-align: center; padding: 20px 0; color: #94a3b8;">
          No quiz questions available for this building yet. Teachers can add questions in Teacher Mode!
        </div>
      `;
      quizModal.classList.add('active');
      return;
    }

    function renderQuestion(qIdx) {
      if (qIdx >= building.quiz.length) {
        quizBody.innerHTML = `
          <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🏆</div>
            <h3>Great Job! Quiz Completed</h3>
            <p style="margin: 12px 0; color: #94a3b8;">
              Score: ${score} / ${building.quiz.length}
            </p>
            <button class="btn btn-primary" id="quiz-finish-btn" style="margin: 10px auto 0;">
              Close
            </button>
          </div>
        `;
        document.getElementById('quiz-finish-btn').addEventListener('click', closeQuiz);
        return;
      }

      const q = building.quiz[qIdx];
      const container = document.createElement('div');
      const questionText = q.question.en || q.question[currentLanguage] || '';
      container.innerHTML = `
        <div class="quiz-question">Q${qIdx + 1}: ${questionText}</div>
        <div class="quiz-options"></div>
      `;

      const optionsDiv = container.querySelector('.quiz-options');
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt.en || opt[currentLanguage] || '';
        btn.addEventListener('click', () => {
          if (opt.correct) {
            btn.classList.add('correct');
            score++;
          } else {
            btn.classList.add('wrong');
          }
          optionsDiv.querySelectorAll('.quiz-option-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => renderQuestion(qIdx + 1), 1200);
        });
        optionsDiv.appendChild(btn);
      });

      quizBody.innerHTML = '';
      quizBody.appendChild(container);
    }

    let score = 0;
    renderQuestion(0);
    quizModal.classList.add('active');
  }

  function closeQuiz() {
    quizModal.classList.remove('active');
  }

  // --- TEACHER ADMIN MODE & PIN PICKER ---

  function openTeacherModal() {
    const bld = window.BUILDINGS[currentBuildingIndex];
    teacherBldName.value = bld.name.en || '';
    teacherBldSubtitle.value = bld.subtitle.en || '';

    // Render 4 Hotspot Editors
    hotspotEditorsContainer.innerHTML = '';
    
    // Ensure building has 4 hotspots
    while (bld.hotspots.length < 4) {
      const idx = bld.hotspots.length + 1;
      bld.hotspots.push({
        id: `custom-spot-${idx}`,
        slot: `hotspot-custom-${idx}`,
        position: "0m 0.3m 0m",
        normal: "0m 1m 0m",
        title: { en: `Point ${idx}`, zh: `加点 ${idx}` },
        description: { en: `Explanation text for point ${idx}...`, zh: `讲解内容 ${idx}...` },
        audioText: { en: `Audio narration for point ${idx}.`, zh: `语音讲解 ${idx}` }
      });
    }

    bld.hotspots.forEach((hs, idx) => {
      const sec = document.createElement('div');
      sec.className = 'editor-section';
      const mType = hs.mediaType || 'image';
      const mUrl = hs.mediaUrl || '';
      if (!hs.images || !Array.isArray(hs.images)) {
        hs.images = mUrl ? [mUrl] : [];
      }

      sec.innerHTML = `
        <div class="editor-section-header">
          <span class="editor-section-title">Pin ${idx + 1} Editor</span>
          <button class="btn" data-reposition-idx="${idx}" style="font-size: 0.8rem; padding: 4px 10px;">
            📍 Reposition Pin ${idx + 1}
          </button>
        </div>
        
        <label class="input-label">Title / Heading</label>
        <input type="text" class="form-input hs-title-input" data-idx="${idx}" value="${(hs.title.en || hs.title.zh || '').replace(/"/g, '&quot;')}">
        
        <label class="input-label" style="margin-top: 8px;">Detailed Description Text</label>
        <textarea class="form-textarea hs-desc-input" data-idx="${idx}">${hs.description.en || hs.description.zh || ''}</textarea>

        <label class="input-label" style="margin-top: 8px;">Speech Narration Text (Voice)</label>
        <input type="text" class="form-input hs-audio-input" data-idx="${idx}" value="${(hs.audioText.en || hs.audioText.zh || '').replace(/"/g, '&quot;')}">

        <label class="input-label" style="margin-top: 8px; color: var(--accent-gold);">Photo / Video Media (Supports Multiple Photos for Repeating Slideshow!)</label>
        <div class="teacher-media-options">
          <select class="teacher-media-select hs-media-type-input" data-idx="${idx}">
            <option value="image" ${mType === 'image' ? 'selected' : ''}>📷 Photo Image / Slideshow</option>
            <option value="video" ${mType === 'video' ? 'selected' : ''}>🎬 Video (MP4 / YouTube)</option>
            <option value="none" ${mType === 'none' ? 'selected' : ''}>🚫 Text Only (No Media)</option>
          </select>
          <button class="btn hs-media-upload-btn" data-idx="${idx}" style="font-size: 0.8rem; padding: 4px 10px;">
            📤 Upload Photo(s) / Video
          </button>
          <input type="file" class="hs-file-input" data-idx="${idx}" accept="image/*,video/*" multiple style="display: none;">
        </div>
        
        <div class="multi-photo-grid hs-photo-grid" data-idx="${idx}">
          <!-- Photo thumbnails rendered here -->
        </div>

        <input type="text" class="form-input hs-media-url-input" data-idx="${idx}" style="margin-top: 6px;" placeholder="Or paste Image/Video URLs (comma separated for multiple photos)..." value="${((hs.images && hs.images.length > 0) ? hs.images.join(', ') : mUrl).replace(/"/g, '&quot;')}">
      `;

      const fileInput = sec.querySelector('.hs-file-input');
      const uploadBtn = sec.querySelector('.hs-media-upload-btn');
      const mediaUrlInput = sec.querySelector('.hs-media-url-input');
      const mediaTypeSelect = sec.querySelector('.hs-media-type-input');
      const photoGrid = sec.querySelector('.hs-photo-grid');

      function renderGrid() {
        photoGrid.innerHTML = '';
        if (!hs.images) hs.images = [];
        hs.images.forEach((imgUrl, imgIdx) => {
          const wrap = document.createElement('div');
          wrap.className = 'photo-thumb-wrapper';
          wrap.innerHTML = `
            <img src="${convertGoogleDriveUrl(imgUrl)}" alt="Photo ${imgIdx + 1}">
            <button class="photo-thumb-del" title="Delete photo">&times;</button>
          `;
          wrap.querySelector('.photo-thumb-del').addEventListener('click', (e) => {
            e.stopPropagation();
            hs.images.splice(imgIdx, 1);
            hs.mediaUrl = hs.images[0] || '';
            const webUrlsOnly = hs.images.filter(img => !img.startsWith('data:'));
            mediaUrlInput.value = webUrlsOnly.join(', ');
            renderGrid();
          });
          photoGrid.appendChild(wrap);
        });
      }

      renderGrid();

      uploadBtn.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let loadedCount = 0;

        for (const file of files) {
          const reader = new FileReader();
          reader.onload = async (evt) => {
            if (!hs.images) hs.images = [];
            if (file.type.startsWith('video/')) {
              hs.mediaUrl = evt.target.result;
              mediaTypeSelect.value = 'video';
            } else {
              const compressedUrl = await compressImage(evt.target.result);
              hs.images.push(compressedUrl);
              hs.mediaUrl = hs.images[0];
              mediaTypeSelect.value = 'image';
            }
            loadedCount++;
            if (loadedCount === files.length) {
              renderGrid();
            }
          };
          reader.readAsDataURL(file);
        }
      });

      mediaUrlInput.addEventListener('input', () => {
        const val = mediaUrlInput.value.trim();
        const textParsed = parseMediaInputString(val);
        const dataUrls = (hs.images || []).filter(img => img.startsWith('data:'));
        hs.images = Array.from(new Set([...dataUrls, ...textParsed]));
        hs.mediaUrl = hs.images[0] || '';
        renderGrid();
      });

      sec.querySelector('[data-reposition-idx]').addEventListener('click', () => {
        startPinPlacementMode(idx);
      });

      hotspotEditorsContainer.appendChild(sec);
    });

    renderQuizEditors();
    teacherModal.classList.add('active');
  }

  // Render Quiz Question Editors in Teacher Mode (Max 10 questions)
  function renderQuizEditors() {
    const bld = window.BUILDINGS[currentBuildingIndex];
    if (!bld.quiz) bld.quiz = [];

    const totalCount = bld.quiz.length;
    const maxLimit = 10;

    // Update Counter Badge
    if (quizCountLabel) {
      quizCountLabel.textContent = `Questions (${totalCount}/${maxLimit} Max):`;
    }

    // Update Add Button State
    if (addQuizQBtn) {
      if (totalCount >= maxLimit) {
        addQuizQBtn.disabled = true;
        addQuizQBtn.style.opacity = '0.5';
        addQuizQBtn.style.cursor = 'not-allowed';
        addQuizQBtn.textContent = `⛔ Max ${maxLimit} Questions`;
      } else {
        addQuizQBtn.disabled = false;
        addQuizQBtn.style.opacity = '1';
        addQuizQBtn.style.cursor = 'pointer';
        addQuizQBtn.textContent = '➕ Add Question';
      }
    }

    quizEditorsContainer.innerHTML = '';

    if (totalCount === 0) {
      quizEditorsContainer.innerHTML = `<div style="color: #94a3b8; text-align: center; padding: 24px;">No quiz questions created yet. Click "➕ Add Question" above!</div>`;
      return;
    }

    const optionLetters = ['A', 'B', 'C', 'D'];

    bld.quiz.forEach((q, qIdx) => {
      const qSec = document.createElement('div');
      qSec.className = 'editor-section';

      // Ensure question has 4 options
      while (!q.options || q.options.length < 4) {
        if (!q.options) q.options = [];
        const optIdx = q.options.length;
        q.options.push({
          en: `Option ${optionLetters[optIdx] || optIdx + 1}`,
          zh: `选项 ${optionLetters[optIdx] || optIdx + 1}`,
          correct: optIdx === 0
        });
      }

      let optionsHtml = '';
      q.options.slice(0, 4).forEach((opt, optIdx) => {
        const isChecked = opt.correct ? 'checked' : '';
        const optVal = (opt.en || opt.zh || '').replace(/"/g, '&quot;');
        const letter = optionLetters[optIdx] || (optIdx + 1);
        optionsHtml += `
          <div class="quiz-option-row">
            <input type="radio" name="correct-opt-${qIdx}" class="quiz-radio-correct" data-opt-idx="${optIdx}" ${isChecked} title="Select Option ${letter} as correct answer">
            <span class="opt-letter-tag">${letter}</span>
            <input type="text" class="form-input q-opt-input" data-opt-idx="${optIdx}" value="${optVal}" placeholder="Option ${letter} text">
          </div>
        `;
      });

      const qText = (q.question.en || q.question.zh || '').replace(/"/g, '&quot;');

      qSec.innerHTML = `
        <div class="editor-section-header">
          <span class="editor-section-title">Question ${qIdx + 1} of ${totalCount} (Multiple Choice)</span>
          <button class="btn delete-q-btn" style="font-size: 0.8rem; padding: 4px 10px; border-color: #ef4444; color: #f87171;">
            🗑️ Delete
          </button>
        </div>
        <label class="input-label">Question Text</label>
        <input type="text" class="form-input q-text-input" value="${qText}" placeholder="e.g. What was the arena floor covered with?">
        
        <label class="input-label" style="margin-top: 10px; color: var(--accent-gold);">
          4 Choices (Select green radio button for the correct answer):
        </label>
        ${optionsHtml}
      `;

      qSec.querySelector('.delete-q-btn').addEventListener('click', () => {
        bld.quiz.splice(qIdx, 1);
        renderQuizEditors();
      });

      quizEditorsContainer.appendChild(qSec);
    });
  }

  // Add Question Button Handler (Enforces 10 Limit & Appends 4-Option Template)
  if (addQuizQBtn) {
    addQuizQBtn.addEventListener('click', () => {
      const bld = window.BUILDINGS[currentBuildingIndex];
      if (!bld.quiz) bld.quiz = [];
      
      if (bld.quiz.length >= 10) {
        alert("You can create a maximum of 10 questions per building.");
        return;
      }

      const newQNum = bld.quiz.length + 1;
      bld.quiz.push({
        question: { en: `Question ${newQNum}`, zh: `问题 ${newQNum}` },
        options: [
          { en: `Option A`, zh: `选项 A`, correct: true },
          { en: `Option B`, zh: `选项 B`, correct: false },
          { en: `Option C`, zh: `选项 C`, correct: false },
          { en: `Option D`, zh: `选项 D`, correct: false }
        ]
      });

      renderQuizEditors();

      // Scroll container to bottom to highlight newly added question template
      setTimeout(() => {
        const scrollElem = paneQuiz.querySelector('.teacher-editor-scroll');
        if (scrollElem) {
          scrollElem.scrollTop = scrollElem.scrollHeight;
        }
      }, 50);
    });
  }

  function closeTeacherModal() {
    teacherModal.classList.remove('active');
  }

  // Start 3D Model Surface Click Pin Placement Mode
  function startPinPlacementMode(hotspotIndex) {
    closeTeacherModal();
    isPickingPinPosition = true;
    targetHotspotIndexToPlace = hotspotIndex;

    placingPinLabel.textContent = `Pin ${hotspotIndex + 1} Placement Mode:`;
    pinPlacementBanner.classList.add('active');
  }

  function cancelPinPlacementMode(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    isPickingPinPosition = false;
    targetHotspotIndexToPlace = null;
    pinPlacementBanner.classList.remove('active');
    openTeacherModal();
  }

  // Handle Surface Clicks on 3D Model Viewer
  modelViewer.addEventListener('click', (event) => {
    if (!isPickingPinPosition || targetHotspotIndexToPlace === null) return;

    // Use <model-viewer> hit testing API
    const rect = modelViewer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hit = modelViewer.positionAndNormalFromPoint(x, y);
    if (hit) {
      const bld = window.BUILDINGS[currentBuildingIndex];
      const hs = bld.hotspots[targetHotspotIndexToPlace];
      
      hs.position = `${hit.position.x.toFixed(3)}m ${hit.position.y.toFixed(3)}m ${hit.position.z.toFixed(3)}m`;
      hs.normal = `${hit.normal.x.toFixed(3)}m ${hit.normal.y.toFixed(3)}m ${hit.normal.z.toFixed(3)}m`;

      console.log(`Pin ${targetHotspotIndexToPlace + 1} repositioned to:`, hs.position);
      
      // Re-render Hotspots
      renderHotspots();

      // Exit Placement Mode
      isPickingPinPosition = false;
      targetHotspotIndexToPlace = null;
      pinPlacementBanner.classList.remove('active');

      // Re-open Teacher Editor Modal
      openTeacherModal();
    }
  });

  // Save Teacher Changes to LocalStorage
  function saveTeacherData() {
    const bld = window.BUILDINGS[currentBuildingIndex];
    bld.name.en = teacherBldName.value;
    bld.subtitle.en = teacherBldSubtitle.value;

    // Save Hotspots
    const titleInputs = hotspotEditorsContainer.querySelectorAll('.hs-title-input');
    const descInputs = hotspotEditorsContainer.querySelectorAll('.hs-desc-input');
    const audioInputs = hotspotEditorsContainer.querySelectorAll('.hs-audio-input');
    const mediaTypeInputs = hotspotEditorsContainer.querySelectorAll('.hs-media-type-input');
    const mediaUrlInputs = hotspotEditorsContainer.querySelectorAll('.hs-media-url-input');

    titleInputs.forEach((inp, idx) => {
      if (bld.hotspots[idx]) {
        bld.hotspots[idx].title.en = inp.value;
        bld.hotspots[idx].title.zh = inp.value;
      }
    });

    descInputs.forEach((inp, idx) => {
      if (bld.hotspots[idx]) {
        bld.hotspots[idx].description.en = inp.value;
        bld.hotspots[idx].description.zh = inp.value;
      }
    });

    audioInputs.forEach((inp, idx) => {
      if (bld.hotspots[idx]) {
        bld.hotspots[idx].audioText.en = inp.value;
        bld.hotspots[idx].audioText.zh = inp.value;
      }
    });

    mediaTypeInputs.forEach((inp, idx) => {
      if (bld.hotspots[idx]) {
        bld.hotspots[idx].mediaType = inp.value;
      }
    });

    mediaUrlInputs.forEach((inp, idx) => {
      const hs = bld.hotspots[idx];
      if (hs) {
        const val = inp.value.trim();
        const textParsed = parseMediaInputString(val);
        const currentDataUrls = (hs.images || []).filter(img => img.startsWith('data:'));
        const finalImages = Array.from(new Set([...currentDataUrls, ...textParsed])).filter(Boolean);
        hs.images = finalImages;
        hs.mediaUrl = finalImages[0] || val || '';
      }
    });

    // Save Quiz Data
    const qSecs = quizEditorsContainer.querySelectorAll('.editor-section');
    const updatedQuiz = [];
    qSecs.forEach((qSec) => {
      const qText = qSec.querySelector('.q-text-input').value;
      const optInputs = qSec.querySelectorAll('.q-opt-input');
      const radioInputs = qSec.querySelectorAll('.quiz-radio-correct');

      const options = [];
      optInputs.forEach((optInp, optIdx) => {
        const isCorrect = radioInputs[optIdx] ? radioInputs[optIdx].checked : (optIdx === 0);
        options.push({
          en: optInp.value,
          zh: optInp.value,
          correct: isCorrect
        });
      });

      updatedQuiz.push({
        question: { en: qText, zh: qText },
        options: options
      });
    });

    bld.quiz = updatedQuiz;

    // Save to LocalStorage
    try {
      localStorage.setItem('webar_teacher_buildings', JSON.stringify(window.BUILDINGS));
      alert('Lesson content, 3D pins, and photos saved successfully!');
    } catch (e) {
      console.error(e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        alert('Storage quota exceeded. The uploaded photo files are too large. Try using smaller compressed images or web URLs.');
      } else {
        alert('Error saving data: ' + e.message);
      }
    }

    closeTeacherModal();
    loadBuilding(currentBuildingIndex);
  }

  function resetTeacherData() {
    if (confirm('Are you sure you want to reset all content and pin positions back to default?')) {
      localStorage.removeItem('webar_teacher_buildings');
      location.reload();
    }
  }

  // JSON Export & Import
  if (exportTeacherDataBtn) {
    exportTeacherDataBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.BUILDINGS, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `webar_lessons_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  if (importTeacherDataInput) {
    importTeacherDataInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            window.BUILDINGS = imported;
            localStorage.setItem('webar_teacher_buildings', JSON.stringify(imported));
            alert('Lesson and quiz data imported successfully!');
            location.reload();
          } else {
            alert('Invalid lesson file format.');
          }
        } catch (err) {
          alert('Error parsing JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  // Event Listeners
  buildingSelect.addEventListener('change', (e) => {
    loadBuilding(parseInt(e.target.value, 10));
  });

  if (quizBtn) {
    quizBtn.addEventListener('click', openQuiz);
  }
  drawerCloseBtn.addEventListener('click', closeDrawer);
  audioPlayBtn.addEventListener('click', toggleAudio);
  quizModalClose.addEventListener('click', closeQuiz);

  teacherModeBtn.addEventListener('click', openTeacherModal);
  teacherModalClose.addEventListener('click', closeTeacherModal);
  cancelPinPlacementBtn.addEventListener('click', cancelPinPlacementMode);
  saveTeacherDataBtn.addEventListener('click', saveTeacherData);
  resetTeacherDataBtn.addEventListener('click', resetTeacherData);

  arPromptBtn.addEventListener('click', () => {
    if (modelViewer.canActivateAR) {
      modelViewer.activateAR();
    } else {
      alert('Please open this link on an AR-capable mobile device browser (such as Safari on iOS or Chrome on Android) to activate AR surface placement.');
    }
  });

  // Init Application
  initBuildingOptions();
  loadBuilding(0);
});
