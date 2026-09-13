/**
 * LESLIE & WALTER — INVITACIÓN DE BODA
 * Lógica interactiva en JavaScript Puro (Vanilla JS)
 * - Contador regresivo en tiempo real al 21 de Noviembre de 2026
 * - Reproductor de música (YouTube API & Audio HTML5)
 * - Botones de copiado al portapapeles con notificación Toast
 * - Animaciones de aparición suave al hacer scroll (Intersection Observer)
 */

document.addEventListener("DOMContentLoaded", () => {
    initScrollAnimations();
    initCountdown();
    initMusicPlayer();
    initGiftListModal();
});

/* =========================================================
   1. ANIMACIONES DE APARICIÓN SUAVE (FADE-IN AL HACER SCROLL)
   ========================================================= */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.section-fade');

    if (!('IntersectionObserver' in window)) {
        fadeElements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    fadeElements.forEach(el => observer.observe(el));
}

/* =========================================================
   2. CONTADOR REGRESIVO EN TIEMPO REAL (SUPERIOR E INFERIOR)
   Fecha de la Boda: 21 de Noviembre de 2026 a las 11:00 AM
   ========================================================= */
function initCountdown() {
    // 21 de Noviembre de 2026 a las 11:00:00 (Hora local de Perú / UTC-5)
    const weddingDate = new Date("2026-11-21T11:00:00").getTime();

    const daysEls = document.querySelectorAll(".time-days, #days");
    const hoursEls = document.querySelectorAll(".time-hours, #hours");
    const minutesEls = document.querySelectorAll(".time-minutes, #minutes");
    const secondsEls = document.querySelectorAll(".time-seconds, #seconds");
    const countdownContainers = document.querySelectorAll(".countdown-container");

    if (!daysEls.length || !hoursEls.length || !minutesEls.length || !secondsEls.length) return;

    function updateTime() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance <= 0) {
            countdownContainers.forEach(container => {
                container.innerHTML = "<h3 style='font-family: var(--font-serif); font-size: 1.8rem; color: var(--wine);'>¡Hoy es nuestro gran día!</h3>";
            });
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dStr = String(days).padStart(2, '0');
        const hStr = String(hours).padStart(2, '0');
        const mStr = String(minutes).padStart(2, '0');
        const sStr = String(seconds).padStart(2, '0');

        daysEls.forEach(el => el.textContent = dStr);
        hoursEls.forEach(el => el.textContent = hStr);
        minutesEls.forEach(el => el.textContent = mStr);
        secondsEls.forEach(el => el.textContent = sStr);
    }

    updateTime();
    setInterval(updateTime, 1000);
}

/* =========================================================
   3. COPIADO AL PORTAPAPELES (BCP Y YAPE)
   ========================================================= */
window.copyToClipboard = function(textToCopy, btnElement) {
    if (!textToCopy) return;

    const showSuccessToast = () => {
        const toast = document.getElementById("toast");
        if (toast) {
            toast.textContent = "¡Copiado al portapapeles! (" + textToCopy + ")";
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 2600);
        }

        // Efecto visual en el botón
        if (btnElement) {
            const originalHTML = btnElement.innerHTML;
            btnElement.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#2e7d32">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            `;
            setTimeout(() => {
                btnElement.innerHTML = originalHTML;
            }, 1800);
        }
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(showSuccessToast)
            .catch(() => fallbackCopy(textToCopy, showSuccessToast));
    } else {
        fallbackCopy(textToCopy, showSuccessToast);
    }
};

function fallbackCopy(text, callback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        callback();
    } catch (err) {
        alert("Número: " + text);
    }
    document.body.removeChild(textArea);
}

/* =========================================================
   4. CONTROL DEL REPRODUCTOR DE MÚSICA & AUTOPLAY
   Canción oficial: [They Long To Be] Close To You — The Carpenters
   Enlace oficial de YouTube: https://www.youtube.com/watch?v=WsYhmo-NsPc
   ========================================================= */

// Enlace o ID del video de YouTube a reproducir
const YOUTUBE_URL_OR_ID = "https://www.youtube.com/watch?v=WsYhmo-NsPc";

// Extrae el ID limpio de 11 caracteres de cualquier URL de YouTube
function getYouTubeVideoId(urlOrId) {
    if (!urlOrId) return "WsYhmo-NsPc";
    urlOrId = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
        return urlOrId;
    }
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : "WsYhmo-NsPc";
}

let ytPlayer = null;
let isPlaying = false;
let userWantsMusic = true;
let activeSource = null; // 'local' | 'youtube'

function initMusicPlayer() {
    const playBtn = document.getElementById("btn-play-pause");
    const prevBtn = document.getElementById("btn-prev");
    const nextBtn = document.getElementById("btn-next");
    const localAudio = document.getElementById("bg-audio");
    const musicText = document.getElementById("music-instruction");
    const welcomeModal = document.getElementById("welcome-modal");
    const openInviteBtn = document.getElementById("btn-open-invite");

    const videoId = getYouTubeVideoId(YOUTUBE_URL_OR_ID);

    function updateUI(playing) {
        isPlaying = playing;
        if (playing) {
            if (playBtn) playBtn.classList.add("playing");
            if (musicText) {
                musicText.innerHTML = 'Nuestra canción está sonando · Presiona <span class="heart-text-icon">❤</span> para pausar';
            }
            removeUnlockListeners();
        } else {
            if (playBtn) playBtn.classList.remove("playing");
            if (musicText) {
                musicText.innerHTML = 'Presiona el <span class="heart-text-icon">❤</span> para escuchar nuestra canción';
            }
        }
    }

    // GESTIÓN DEL MODAL DE ENTRADA (ABRIR INVITACIÓN)
    function dismissModalAndPlay() {
        if (welcomeModal) {
            welcomeModal.classList.add("hidden");
        }
        userWantsMusic = true;
        startPlayback();
    }

    if (openInviteBtn) {
        openInviteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dismissModalAndPlay();
        });
    }

    if (welcomeModal) {
        welcomeModal.addEventListener("click", (e) => {
            if (e.target === welcomeModal) {
                dismissModalAndPlay();
            }
        });
    }

    // Configuración oficial de la API de YouTube Iframe
    function setupYTPlayer() {
        if (window.YT && window.YT.Player && !ytPlayer) {
            try {
                ytPlayer = new YT.Player('youtube-player', {
                    height: '200',
                    width: '200',
                    videoId: videoId,
                    playerVars: {
                        'autoplay': 0,
                        'controls': 0,
                        'loop': 1,
                        'playlist': videoId,
                        'playsinline': 1,
                        'rel': 0,
                        'enablejsapi': 1
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            } catch (e) {
                console.warn("YouTube API init error:", e);
            }
        }
    }

    window.onYouTubeIframeAPIReady = function() {
        setupYTPlayer();
    };

    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    } else {
        setupYTPlayer();
    }

    function onPlayerReady(event) {
        if (userWantsMusic && !isPlaying && activeSource !== 'local') {
            playYouTube();
        }
    }

    function onPlayerStateChange(event) {
        // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0
        if (event.data === 1) {
            activeSource = 'youtube';
            updateUI(true);
        } else if (event.data === 2) {
            if (activeSource === 'youtube') updateUI(false);
        } else if (event.data === 0 && userWantsMusic) {
            try {
                event.target.seekTo(0);
                event.target.playVideo();
            } catch (e) {}
        }
    }

    // Listeners para audio local HTML5
    if (localAudio) {
        localAudio.addEventListener('play', () => {
            activeSource = 'local';
            // Si YouTube estaba sonando, pausarlo
            if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
                try { ytPlayer.pauseVideo(); } catch (e) {}
            }
            updateUI(true);
        });
        localAudio.addEventListener('pause', () => {
            if (activeSource === 'local') {
                updateUI(false);
            }
        });
        localAudio.addEventListener('ended', () => {
            if (userWantsMusic) {
                localAudio.currentTime = 0;
                localAudio.play().catch(() => {});
            }
        });
    }

    function playYouTube() {
        if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
            try {
                ytPlayer.unMute();
                ytPlayer.playVideo();
                return true;
            } catch (e) {
                console.warn("YouTube playVideo error:", e);
            }
        }
        return false;
    }

    function startPlayback() {
        if (!userWantsMusic) return;

        // Prioridad 1: Audio local HTML5 (cancion.mp3 / cancion.m4a)
        // Permite reproducción inmediata sin buffering de video ni restricciones de AdBlock
        if (localAudio) {
            const playPromise = localAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    activeSource = 'local';
                    updateUI(true);
                }).catch(() => {
                    // Si el archivo local no carga (404 o no soportado), reproducir con YouTube
                    playYouTube();
                });
                return;
            }
        }

        // Prioridad 2: Reproductor oficial de YouTube
        playYouTube();
    }

    function pausePlayback() {
        userWantsMusic = false;
        if (localAudio && !localAudio.paused) {
            localAudio.pause();
        }
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
            try { ytPlayer.pauseVideo(); } catch (e) {}
        }
        updateUI(false);
    }

    // Activación ante primer gesto o scroll para cumplir políticas de autoplay
    const unlockEvents = ['touchstart', 'touchend', 'pointerdown', 'click', 'scroll', 'keydown', 'wheel'];

    function unlockAudioOnFirstInteraction() {
        if (welcomeModal && !welcomeModal.classList.contains("hidden")) {
            welcomeModal.classList.add("hidden");
        }
        if (userWantsMusic && !isPlaying) {
            startPlayback();
        }
    }

    function removeUnlockListeners() {
        unlockEvents.forEach(evt => {
            window.removeEventListener(evt, unlockAudioOnFirstInteraction, { passive: true });
            document.removeEventListener(evt, unlockAudioOnFirstInteraction, { passive: true });
        });
    }

    unlockEvents.forEach(evt => {
        window.addEventListener(evt, unlockAudioOnFirstInteraction, { passive: true });
        document.addEventListener(evt, unlockAudioOnFirstInteraction, { passive: true });
    });

    // Botón Corazón central (Play / Pause)
    if (playBtn) {
        playBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (isPlaying) {
                pausePlayback();
            } else {
                userWantsMusic = true;
                startPlayback();
            }
        });
    }

    // Botones Anterior / Siguiente (reinician la canción al principio)
    function restartSong() {
        if (activeSource === 'local' && localAudio) {
            localAudio.currentTime = 0;
            userWantsMusic = true;
            localAudio.play().then(() => updateUI(true)).catch(() => {});
        } else if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
            ytPlayer.seekTo(0);
            userWantsMusic = true;
            ytPlayer.playVideo();
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            restartSong();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            restartSong();
        });
    }
}

/* =========================================================
   6. MODAL DE LISTA DE REGALOS (SELECCIÓN Y WHATSAPP)
   ========================================================= */
function initGiftListModal() {
    const modal = document.getElementById("giftlist-modal");
    const btnOpen = document.getElementById("btn-open-giftlist");
    const btnClose = document.getElementById("btn-close-giftlist");
    const btnDone = document.getElementById("btn-done-giftlist");
    const backdrop = document.getElementById("giftlist-backdrop");
    const checkboxes = document.querySelectorAll(".gift-checkbox-input");
    const countNumber = document.getElementById("count-number");
    const whatsappBtn = document.getElementById("btn-whatsapp-gift");

    if (!modal || !btnOpen) return;

    const STORAGE_KEY = "wedding_gifts_selected";

    // Cargar selecciones previas guardadas en localStorage
    function loadSavedSelections() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            checkboxes.forEach(cb => {
                const label = cb.closest(".gift-item-label");
                if (saved.includes(cb.value)) {
                    cb.checked = true;
                    if (label) {
                        label.classList.add("checked");
                        const statusEl = label.querySelector(".gift-item-status");
                        if (statusEl) statusEl.textContent = "✓ Marcado como tu regalo";
                    }
                }
            });
            updateSummary();
        } catch(e) {
            console.warn("No se pudo leer localStorage:", e);
        }
    }

    // Actualizar contador y enlace a WhatsApp
    function updateSummary() {
        const selectedValues = [];
        checkboxes.forEach(cb => {
            if (cb.checked) selectedValues.push(cb.value);
        });

        if (countNumber) {
            countNumber.textContent = selectedValues.length;
        }

        // Guardar selecciones en localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedValues));
        } catch(e) {}

        // Actualizar URL de WhatsApp con mensaje personalizado
        if (whatsappBtn) {
            let message = "";
            if (selectedValues.length > 0) {
                message = `¡Hola Leslie y Walter! 💍 Queremos felicitarlos por su matrimonio. De su lista de regalos, con mucho cariño nos gustaría apoyarlos con: ${selectedValues.join(", ")} 🎁`;
            } else {
                message = "¡Hola Leslie y Walter! 💍 Queremos felicitarlos por su matrimonio y consultarles sobre su lista de regalos de boda para su nuevo hogar 🎁";
            }
            whatsappBtn.href = `https://wa.me/51995585320?text=${encodeURIComponent(message)}`;
        }
    }

    // Listener para los checkboxes
    checkboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const label = cb.closest(".gift-item-label");
            const statusEl = label ? label.querySelector(".gift-item-status") : null;
            if (cb.checked) {
                if (label) label.classList.add("checked");
                if (statusEl) statusEl.textContent = "✓ Marcado como tu regalo";
            } else {
                if (label) label.classList.remove("checked");
                if (statusEl) statusEl.textContent = "Sugerido para el hogar";
            }
            updateSummary();
        });
    });

    // Abrir modal
    function openModal() {
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-active");
    }

    // Cerrar modal
    function closeModal() {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-active");
    }

    btnOpen.addEventListener("click", openModal);
    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnDone) btnDone.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    // Cerrar con tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            closeModal();
        }
    });

    // Cargar selecciones al inicio
    loadSavedSelections();
}