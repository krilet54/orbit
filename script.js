/* ========================================
   ORBIT — Premium AI Jukebox
   JavaScript Controller (Supabase Edition)
   Enhanced with Premium Features
   ======================================== */

// ========================================
// FALLBACK TRACK DATABASE
// Used when Supabase is not configured or no songs exist
// ========================================

const fallbackTracks = [
    {
        id: 1,
        title: "Midnight Drive",
        theme: "Synthwave • Nostalgia",
        summary: "A nostalgic journey through neon-lit city streets at night, where memories blend with the hum of the engine and the glow of distant lights.",
        cover_url: null,
        lyrics: `Neon lights blur past my window
Chasing shadows down the highway
The city sleeps but I'm alive
In this midnight drive

Chrome reflections on the pavement
Memories of better days
Radio plays our favorite song
As I drift along

Midnight drive, take me home
Through the static and the chrome
Midnight drive, I'm not alone
The music guides me through the unknown`,
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        id: 2,
        title: "Golden Hour",
        theme: "Lo-Fi • Reflection",
        summary: "A peaceful meditation on those perfect moments when time seems to slow down and the world is bathed in warm, golden light.",
        cover_url: null,
        lyrics: `Sun dips low on the horizon
Painting everything in gold
Time slows down in this moment
Stories left untold

Coffee steam rises gently
Words unspoken fill the air
In this golden hour
Nothing else can compare

Let the warmth wash over
Every worry fades away
In this golden hour
I finally found my way`,
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        id: 3,
        title: "Electric Dreams",
        theme: "Electronic • Futurism",
        summary: "An exploration of digital consciousness and the boundless possibilities of a future where technology and imagination merge.",
        cover_url: null,
        lyrics: `Circuits pulse with energy
Data streams like waterfalls
In this digital dimension
Breaking down the walls

Zeros and ones collide
Creating worlds unseen
In this electric fantasy
More real than any dream

Electric dreams light up the night
Binary stars burning bright
In the code we find our way
A new tomorrow starts today`,
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        id: 4,
        title: "Velvet Night",
        theme: "Jazz • Intimacy",
        summary: "An intimate jazz ballad that captures the magic of late-night conversations and unspoken connections in dimly lit spaces.",
        cover_url: null,
        lyrics: `Smoke curls in the dim light
Piano keys softly play
Your silhouette moves closer
Words we'll never say

Velvet night surrounds us
Time suspended here
In this moment captured
Everything is clear

The melody carries us
Through shadows soft and deep
In this velvet night
Promises we'll keep`,
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
        id: 5,
        title: "Chasing Horizons",
        theme: "Ambient • Adventure",
        summary: "An ambient soundscape that evokes the spirit of adventure and the endless possibilities that lie beyond the horizon.",
        cover_url: null,
        lyrics: `Mountains rise before me
Endless sky above
Every step brings wonder
Every breath is love

Chasing horizons
Where the earth meets sky
No destination needed
Just the will to fly

Let the wind guide you
Let the road unfold
Chasing horizons
Stories yet untold`,
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    },
    {
        id: 6,
        title: "Neon Pulse",
        theme: "Techno • Energy",
        summary: "A high-energy techno anthem that captures the pulse-pounding excitement of the dance floor and the freedom of losing yourself in the beat.",
        cover_url: null,
        lyrics: `Bass drops through the floor
Lights flash to the beat
Bodies move in rhythm
Feel the rising heat

Neon pulse keeps pounding
Through the smoky haze
Lost inside the music
Set your soul ablaze

Surrender to the frequency
Let it take control
Neon pulse is calling
Deep within your soul`,
        audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
    }
];

// ========================================
// SUPABASE INTEGRATION
// ========================================

async function loadTracksFromSupabase() {
    try {
        // Check if Supabase is configured
        if (typeof orbitSupabase === 'undefined' || 
            typeof SUPABASE_URL === 'undefined' ||
            SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL') {
            console.log('Supabase not configured, using fallback tracks');
            return fallbackTracks;
        }

        const { data, error } = await orbitSupabase
            .from('songs')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return fallbackTracks;
        }

        if (data && data.length > 0) {
            console.log(`Loaded ${data.length} songs from Supabase`);
            return data;
        }

        console.log('No songs in Supabase, using fallback tracks');
        return fallbackTracks;
    } catch (error) {
        console.error('Failed to load from Supabase:', error);
        return fallbackTracks;
    }
}

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    jukebox: document.querySelector('.jukebox'),
    audioPlayer: document.getElementById('audioPlayer'),
    audioPlayerB: document.getElementById('audioPlayerB'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    skipBtn: document.getElementById('skipBtn'),
    shareBtn: document.getElementById('shareBtn'),
    // Header elements
    currentSongTitle: document.getElementById('currentSongTitle'),
    // Song details elements
    songTitle: document.getElementById('songTitle'),
    songTheme: document.getElementById('songTheme'),
    songSummary: document.getElementById('songSummary'),
    songCover: document.getElementById('songCover'),
    // Lyrics elements
    lyricsText: document.getElementById('lyricsText'),
    lyricsToggle: document.getElementById('lyricsToggle'),
    lyricsContainer: document.getElementById('lyricsContainer'),
    // Progress bar elements
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    progressHandle: document.getElementById('progressHandle'),
    progressHoverTime: document.getElementById('progressHoverTime'),
    currentTime: document.getElementById('currentTime'),
    duration: document.getElementById('duration'),
    // Queue preview
    queuePreview: document.getElementById('queuePreview'),
    nextSongTitle: document.getElementById('nextSongTitle'),
    // Lyrics modal
    lyricsModal: document.getElementById('lyricsModal'),
    lyricsModalClose: document.getElementById('lyricsModalClose'),
    lyricsModalTitle: document.getElementById('lyricsModalTitle'),
    lyricsModalCover: document.getElementById('lyricsModalCover'),
    lyricsModalText: document.getElementById('lyricsModalText'),
    // Share modal
    shareModal: document.getElementById('shareModal'),
    shareModalClose: document.getElementById('shareModalClose'),
    shareSongCover: document.getElementById('shareSongCover'),
    shareSongTitle: document.getElementById('shareSongTitle'),
    shareSongTheme: document.getElementById('shareSongTheme'),
    shareWhatsApp: document.getElementById('shareWhatsApp'),
    shareTwitter: document.getElementById('shareTwitter'),
    shareCopy: document.getElementById('shareCopy'),
    shareLinkInput: document.getElementById('shareLinkInput'),
    shareCopied: document.getElementById('shareCopied'),
    // Loading & shortcuts
    loadingScreen: document.getElementById('loadingScreen'),
    shortcutsToast: document.getElementById('shortcutsToast'),
    // Other elements
    songDetails: document.querySelector('.song-details'),
    glow: document.querySelector('.glow'),
    discInner: document.querySelector('.disc-inner')
};

// ========================================
// STATE
// ========================================

let state = {
    tracks: [],
    currentTrackIndex: -1,
    isPlaying: false,
    lyricsExpanded: false,
    lyricsModalOpen: false,
    shareModalOpen: false,
    audioContext: null,
    analyser: null,
    analyserB: null,
    sourceA: null,
    sourceB: null,
    isInitialized: false,
    isDragging: false,
    hasShownShortcuts: false,
    // Crossfade
    activePlayer: 'A',
    isCrossfading: false,
    crossfadeDuration: 2000
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getRandomTrackIndex(excludeIndex = -1) {
    if (state.tracks.length === 0) return -1;
    if (state.tracks.length === 1) return 0;
    
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * state.tracks.length);
    } while (newIndex === excludeIndex);
    return newIndex;
}

function getNextTrackIndex() {
    if (state.tracks.length === 0) return -1;
    return (state.currentTrackIndex + 1) % state.tracks.length;
}

// Generate a gradient color based on song title (deterministic)
function generateCoverGradient(title) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 60%, 45%) 0%, hsl(${hue2}, 50%, 25%) 100%)`;
}

// ========================================
// LOADING SCREEN
// ========================================

function hideLoadingScreen() {
    setTimeout(() => {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('hidden');
        }
        document.body.classList.add('page-transition');
    }, 800);
}

// ========================================
// AUDIO CONTROL
// ========================================

function getActivePlayer() {
    return state.activePlayer === 'A' ? elements.audioPlayer : elements.audioPlayerB;
}

function getInactivePlayer() {
    return state.activePlayer === 'A' ? elements.audioPlayerB : elements.audioPlayer;
}

function loadTrack(index, withCrossfade = false) {
    const track = state.tracks[index];
    if (!track) return;

    // Update meta tags for sharing
    updateMetaTags(track);

    // Reset progress bar
    if (!withCrossfade) {
        resetProgress();
    }

    // Add transitioning state
    elements.songDetails.classList.add('transitioning');

    // Update UI
    setTimeout(() => {
        // Update header title
        elements.currentSongTitle.textContent = track.title;
        
        // Update song details
        elements.songTitle.textContent = track.title;
        elements.songTheme.textContent = track.theme || '—';
        elements.songSummary.textContent = track.summary || 'Discover a new sonic experience crafted by AI.';
        elements.lyricsText.textContent = track.lyrics || 'No lyrics available';
        
        // Update cover
        if (track.cover_url) {
            elements.songCover.style.backgroundImage = `url(${track.cover_url})`;
            elements.songCover.style.backgroundSize = 'cover';
            elements.songCover.style.backgroundPosition = 'center';
            elements.songCover.classList.add('has-cover');
            
            // Update disc cover art
            if (elements.discInner) {
                elements.discInner.style.backgroundImage = `url(${track.cover_url})`;
                elements.discInner.classList.add('has-cover');
            }
            
            // Update lyrics modal cover
            if (elements.lyricsModalCover) {
                elements.lyricsModalCover.style.backgroundImage = `url(${track.cover_url})`;
            }
        } else {
            // Generate a unique gradient based on song title
            const gradient = generateCoverGradient(track.title);
            elements.songCover.style.backgroundImage = gradient;
            elements.songCover.classList.remove('has-cover');
            
            // Update disc with gradient
            if (elements.discInner) {
                elements.discInner.style.backgroundImage = gradient;
                elements.discInner.classList.add('has-cover');
            }
            
            // Update lyrics modal cover
            if (elements.lyricsModalCover) {
                elements.lyricsModalCover.style.backgroundImage = gradient;
            }
        }
        
        // Update lyrics modal
        if (elements.lyricsModalTitle) {
            elements.lyricsModalTitle.textContent = track.title;
        }
        if (elements.lyricsModalText) {
            updateLyricsModal(track.lyrics || 'No lyrics available');
        }
        
        elements.songDetails.classList.remove('transitioning');
    }, 150);

    // Load audio - use inactive player for crossfade
    const audioUrl = track.audio_url;
    console.log('Loading audio from:', audioUrl);
    
    if (withCrossfade && state.isPlaying) {
        const inactivePlayer = getInactivePlayer();
        inactivePlayer.src = audioUrl;
        inactivePlayer.load();
    } else {
        elements.audioPlayer.src = audioUrl;
        elements.audioPlayer.load();
    }

    state.currentTrackIndex = index;
    
    // Update queue preview
    updateQueuePreview();
    
    // Update URL for sharing
    updateShareURL(track);
}

function updateMetaTags(track) {
    // Update Open Graph meta tags dynamically
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    
    const title = `${track.title} — ORBIT`;
    const desc = track.summary || 'Hear the unheard. Discover music created through the fusion of AI and human imagination.';
    
    if (ogTitle) ogTitle.content = title;
    if (ogDesc) ogDesc.content = desc;
    if (ogImage && track.cover_url) ogImage.content = track.cover_url;
    if (twitterTitle) twitterTitle.content = title;
    if (twitterDesc) twitterDesc.content = desc;
    
    document.title = title;
}

function updateShareURL(track) {
    const url = new URL(window.location.href);
    url.searchParams.set('song', track.id);
    window.history.replaceState({}, '', url);
}

function play() {
    // Try to initialize audio context on user interaction
    if (!state.isInitialized && state.audioContext === null) {
        try {
            initAudioContext();
        } catch (e) {
            console.log('AudioContext init skipped:', e);
        }
        state.isInitialized = true;
    }

    const player = getActivePlayer();
    player.play()
        .then(() => {
            state.isPlaying = true;
            updatePlayState();
            console.log('Playback started successfully');
            
            // Show shortcuts toast on first play
            if (!state.hasShownShortcuts) {
                showShortcutsToast();
                state.hasShownShortcuts = true;
            }
        })
        .catch(error => {
            console.error('Playback failed:', error);
        });
}

function pause() {
    const player = getActivePlayer();
    player.pause();
    state.isPlaying = false;
    updatePlayState();
}

function togglePlayPause() {
    if (state.isPlaying) {
        pause();
    } else {
        play();
    }
}

function crossfade(newIndex) {
    if (state.isCrossfading) return;
    state.isCrossfading = true;
    
    const currentPlayer = getActivePlayer();
    const nextPlayer = getInactivePlayer();
    
    // Load new track into next player
    const track = state.tracks[newIndex];
    nextPlayer.src = track.audio_url;
    nextPlayer.load();
    nextPlayer.volume = 0;
    
    // Start next player
    nextPlayer.play().then(() => {
        const startTime = Date.now();
        const duration = state.crossfadeDuration;
        
        function fade() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-in-out curve
            const eased = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            currentPlayer.volume = 1 - eased;
            nextPlayer.volume = eased;
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                // Crossfade complete
                currentPlayer.pause();
                currentPlayer.volume = 1;
                state.activePlayer = state.activePlayer === 'A' ? 'B' : 'A';
                state.isCrossfading = false;
                
                // Update progress bar to track new player
                resetProgress();
            }
        }
        
        fade();
    }).catch(err => {
        console.error('Crossfade failed:', err);
        state.isCrossfading = false;
    });
    
    // Update track info immediately
    state.currentTrackIndex = newIndex;
    loadTrack(newIndex, true);
}

function skipTrack() {
    const nextIndex = getRandomTrackIndex(state.currentTrackIndex);
    
    if (state.isPlaying && !state.isCrossfading) {
        // Use crossfade when playing
        crossfade(nextIndex);
    } else {
        // Normal skip when paused
        elements.jukebox.classList.add('spin-burst');
        elements.jukebox.classList.remove('playing', 'paused');

        setTimeout(() => {
            elements.jukebox.classList.remove('spin-burst');
            loadTrack(nextIndex);
            if (state.isPlaying) {
                play();
            } else {
                play();
            }
        }, 500);
    }
}

function updatePlayState() {
    if (state.isPlaying) {
        elements.jukebox.classList.add('playing');
        elements.jukebox.classList.remove('paused');
        document.body.classList.add('playing');
    } else {
        elements.jukebox.classList.remove('playing');
        elements.jukebox.classList.add('paused');
        document.body.classList.remove('playing');
    }
}

// ========================================
// QUEUE PREVIEW
// ========================================

function updateQueuePreview() {
    if (!elements.queuePreview || !elements.nextSongTitle) return;
    
    const nextIndex = getNextTrackIndex();
    if (nextIndex >= 0 && state.tracks[nextIndex]) {
        elements.nextSongTitle.textContent = state.tracks[nextIndex].title;
        elements.queuePreview.classList.add('visible');
    } else {
        elements.nextSongTitle.textContent = '—';
    }
}

// ========================================
// LYRICS PANEL & MODAL
// ========================================

function toggleLyrics() {
    state.lyricsExpanded = !state.lyricsExpanded;
    
    if (state.lyricsExpanded) {
        elements.lyricsContainer.classList.add('expanded');
        elements.lyricsToggle.classList.add('active');
    } else {
        elements.lyricsContainer.classList.remove('expanded');
        elements.lyricsToggle.classList.remove('active');
    }
}

function updateLyricsModal(lyrics) {
    if (!elements.lyricsModalText) return;
    
    // Split lyrics into lines and wrap each in a span
    const lines = lyrics.split('\n');
    const formattedLines = lines.map((line, i) => 
        `<span class="lyric-line" data-line="${i}">${line || '&nbsp;'}</span>`
    ).join('');
    
    elements.lyricsModalText.innerHTML = formattedLines;
}

function openLyricsModal() {
    if (!elements.lyricsModal) return;
    
    state.lyricsModalOpen = true;
    elements.lyricsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLyricsModal() {
    if (!elements.lyricsModal) return;
    
    state.lyricsModalOpen = false;
    elements.lyricsModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// PROGRESS BAR
// ========================================

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
    if (state.isDragging) return;
    
    const player = getActivePlayer();
    const current = player.currentTime;
    const duration = player.duration;
    
    if (duration && isFinite(duration)) {
        const percent = (current / duration) * 100;
        elements.progressFill.style.width = `${percent}%`;
        elements.progressHandle.style.left = `${percent}%`;
        elements.currentTime.textContent = formatTime(current);
        elements.duration.textContent = formatTime(duration);
    }
}

function updateDuration() {
    const player = getActivePlayer();
    const duration = player.duration;
    if (duration && isFinite(duration)) {
        elements.duration.textContent = formatTime(duration);
    }
}

function resetProgress() {
    elements.progressFill.style.width = '0%';
    elements.progressHandle.style.left = '0%';
    elements.currentTime.textContent = '0:00';
    elements.duration.textContent = '0:00';
}

function seekTo(e) {
    const rect = elements.progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const player = getActivePlayer();
    const duration = player.duration;
    
    if (duration && isFinite(duration)) {
        player.currentTime = percent * duration;
        elements.progressFill.style.width = `${percent * 100}%`;
        elements.progressHandle.style.left = `${percent * 100}%`;
        elements.currentTime.textContent = formatTime(percent * duration);
    }
}

function updateHoverTime(e) {
    if (!elements.progressHoverTime) return;
    
    const rect = elements.progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const player = getActivePlayer();
    const duration = player.duration;
    
    if (duration && isFinite(duration)) {
        const time = percent * duration;
        elements.progressHoverTime.textContent = formatTime(time);
        elements.progressHoverTime.style.left = `${percent * 100}%`;
    }
}

function initProgressBar() {
    // Click to seek
    elements.progressBar.addEventListener('click', seekTo);
    
    // Hover to show time preview
    elements.progressBar.addEventListener('mousemove', updateHoverTime);
    
    // Drag to scrub
    elements.progressBar.addEventListener('mousedown', (e) => {
        state.isDragging = true;
        elements.progressBar.classList.add('dragging');
        seekTo(e);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (state.isDragging) {
            seekTo(e);
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (state.isDragging) {
            state.isDragging = false;
            elements.progressBar.classList.remove('dragging');
        }
    });
    
    // Touch support for mobile
    elements.progressBar.addEventListener('touchstart', (e) => {
        state.isDragging = true;
        elements.progressBar.classList.add('dragging');
        const touch = e.touches[0];
        seekTo({ clientX: touch.clientX });
    });
    
    document.addEventListener('touchmove', (e) => {
        if (state.isDragging) {
            const touch = e.touches[0];
            seekTo({ clientX: touch.clientX });
        }
    });
    
    document.addEventListener('touchend', () => {
        if (state.isDragging) {
            state.isDragging = false;
            elements.progressBar.classList.remove('dragging');
        }
    });
    
    // Audio events for progress updates
    elements.audioPlayer.addEventListener('timeupdate', updateProgress);
    elements.audioPlayer.addEventListener('loadedmetadata', updateDuration);
    elements.audioPlayer.addEventListener('durationchange', updateDuration);
    
    // Events for second player (crossfade)
    if (elements.audioPlayerB) {
        elements.audioPlayerB.addEventListener('timeupdate', updateProgress);
        elements.audioPlayerB.addEventListener('loadedmetadata', updateDuration);
        elements.audioPlayerB.addEventListener('durationchange', updateDuration);
    }
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

function showShortcutsToast() {
    if (!elements.shortcutsToast) return;
    
    elements.shortcutsToast.classList.add('visible');
    
    setTimeout(() => {
        elements.shortcutsToast.classList.remove('visible');
    }, 4000);
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowRight':
            case 'KeyN':
                skipTrack();
                break;
            case 'KeyL':
                if (state.lyricsModalOpen) {
                    closeLyricsModal();
                } else {
                    openLyricsModal();
                }
                break;
            case 'KeyS':
                if (state.shareModalOpen) {
                    closeShareModal();
                } else {
                    openShareModal();
                }
                break;
            case 'Escape':
                if (state.lyricsModalOpen) {
                    closeLyricsModal();
                }
                if (state.shareModalOpen) {
                    closeShareModal();
                }
                break;
        }
    });
}

// ========================================
// MOBILE GESTURES
// ========================================

function initMobileGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const swipeThreshold = 80;
    
    const discContainer = elements.jukebox?.querySelector('.disc-container');
    if (!discContainer) return;
    
    discContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    discContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Only trigger horizontal swipes (ignore vertical scrolling)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                // Swipe right - could be previous track
                skipTrack();
            } else {
                // Swipe left - skip to next
                skipTrack();
            }
        }
    }, { passive: true });
}

// ========================================
// WEB AUDIO API (Beat-Reactive Glow)
// ========================================

function initAudioContext() {
    try {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 256;

        const source = state.audioContext.createMediaElementSource(elements.audioPlayer);
        source.connect(state.analyser);
        state.analyser.connect(state.audioContext.destination);

        // Start beat detection
        detectBeat();
    } catch (error) {
        console.log('Web Audio API not supported:', error);
    }
}

function detectBeat() {
    if (!state.analyser) return;

    const bufferLength = state.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const navbar = document.querySelector('.navbar');
    const glow = elements.glow;

    let lastBeatTime = 0;
    const beatThreshold = 170;
    const beatCooldown = 60;
    
    // Smoothing for glow animations - different speeds for attack/release
    let smoothBass = 0;
    let smoothHighs = 0;
    let peakBass = 0;
    const attackSpeed = 0.5;  // Fast response to bass hits
    const releaseSpeed = 0.08; // Slow decay for smooth falloff

    function analyze() {
        if (!state.isPlaying) {
            // Fade out glow when not playing
            smoothBass *= 0.95;
            smoothHighs *= 0.95;
            peakBass *= 0.95;
            if (glow) {
                glow.style.transform = `scale(${1 + smoothBass * 0.3})`;
                glow.style.opacity = 0.3 + smoothBass * 0.5;
            }
            requestAnimationFrame(analyze);
            return;
        }

        state.analyser.getByteFrequencyData(dataArray);

        // Sub-bass (20-60Hz) - indices 0-2 - the real thump
        let subBassSum = 0;
        for (let i = 0; i < 3; i++) {
            subBassSum += dataArray[i];
        }
        const subBassAverage = subBassSum / 3;
        
        // Bass frequencies (60-150Hz) - indices 3-6
        let bassSum = 0;
        for (let i = 3; i < 7; i++) {
            bassSum += dataArray[i];
        }
        const bassAverage = bassSum / 4;
        
        // Combined bass power
        const totalBass = (subBassAverage * 0.7 + bassAverage * 0.3);
        const bassNormalized = Math.min(totalBass / 220, 1);
        
        // High frequencies (4kHz+) for shimmer
        let highSum = 0;
        for (let i = 60; i < bufferLength; i++) {
            highSum += dataArray[i];
        }
        const highAverage = highSum / (bufferLength - 60);
        const highNormalized = Math.min(highAverage / 180, 1);
        
        // Asymmetric smoothing - fast attack, slow release
        if (bassNormalized > smoothBass) {
            smoothBass = smoothBass + (bassNormalized - smoothBass) * attackSpeed;
        } else {
            smoothBass = smoothBass + (bassNormalized - smoothBass) * releaseSpeed;
        }
        
        // Track peak for extra punch on big hits
        if (bassNormalized > peakBass) {
            peakBass = bassNormalized;
        } else {
            peakBass *= 0.92;
        }
        
        // Highs smooth normally
        smoothHighs = smoothHighs + (highNormalized - smoothHighs) * 0.2;
        
        // Update glow with bass-driven pulsing
        if (glow) {
            // Scale pulses with bass - more dramatic
            const pulseScale = 1 + smoothBass * 0.35 + peakBass * 0.15;
            
            // Opacity breathes with bass
            const pulseOpacity = 0.35 + smoothBass * 0.55 + peakBass * 0.1;
            
            // Blur tightens on bass hits for more punch
            const blurAmount = 70 - smoothBass * 20;
            
            // Brightness increases with highs and bass
            const brightness = 1 + smoothHighs * 0.3 + peakBass * 0.2;
            
            glow.style.transform = `scale(${pulseScale})`;
            glow.style.opacity = pulseOpacity;
            glow.style.filter = `blur(${blurAmount}px) brightness(${brightness})`;
        }
        
        // Update navbar glow intensity
        if (navbar) {
            const combinedIntensity = (smoothBass * 0.7 + smoothHighs * 0.3);
            navbar.style.setProperty('--audio-intensity', combinedIntensity);
        }

        const now = Date.now();
        if (totalBass > beatThreshold && now - lastBeatTime > beatCooldown) {
            // Trigger beat animation on jukebox
            elements.jukebox.classList.add('beat-active');
            setTimeout(() => {
                elements.jukebox.classList.remove('beat-active');
            }, 80);
            
            // Trigger beat animation on navbar
            if (navbar) {
                navbar.classList.add('beat-active');
                setTimeout(() => {
                    navbar.classList.remove('beat-active');
                }, 80);
            }
            
            lastBeatTime = now;
        }

        requestAnimationFrame(analyze);
    }

    analyze();
}

// ========================================
// SHARE FUNCTIONALITY
// ========================================

function initShareModal() {
    if (elements.shareBtn) {
        elements.shareBtn.addEventListener('click', openShareModal);
    }
    if (elements.shareModalClose) {
        elements.shareModalClose.addEventListener('click', closeShareModal);
    }
    if (elements.shareModal) {
        elements.shareModal.querySelector('.share-modal-backdrop')?.addEventListener('click', closeShareModal);
    }
    if (elements.shareWhatsApp) {
        elements.shareWhatsApp.addEventListener('click', shareToWhatsApp);
    }
    if (elements.shareTwitter) {
        elements.shareTwitter.addEventListener('click', shareToTwitter);
    }
    if (elements.shareCopy) {
        elements.shareCopy.addEventListener('click', copyShareLink);
    }
}

function openShareModal() {
    if (!elements.shareModal) return;
    
    const track = state.tracks[state.currentTrackIndex];
    if (!track) return;
    
    // Update modal content
    if (elements.shareSongTitle) {
        elements.shareSongTitle.textContent = track.title;
    }
    if (elements.shareSongTheme) {
        elements.shareSongTheme.textContent = track.theme || 'AI Music';
    }
    if (elements.shareSongCover) {
        if (track.cover_url) {
            elements.shareSongCover.style.backgroundImage = `url(${track.cover_url})`;
        } else {
            elements.shareSongCover.style.backgroundImage = generateCoverGradient(track.title);
        }
    }
    
    // Generate share URL
    const shareUrl = generateShareUrl(track);
    if (elements.shareLinkInput) {
        elements.shareLinkInput.value = shareUrl;
    }
    
    // Hide copied message
    if (elements.shareCopied) {
        elements.shareCopied.classList.remove('show');
    }
    
    elements.shareModal.classList.add('active');
    state.shareModalOpen = true;
    document.body.style.overflow = 'hidden';
}

function closeShareModal() {
    if (!elements.shareModal) return;
    
    elements.shareModal.classList.remove('active');
    state.shareModalOpen = false;
    document.body.style.overflow = '';
}

function generateShareUrl(track) {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('song', track.id);
    return url.toString();
}

function shareToWhatsApp() {
    const track = state.tracks[state.currentTrackIndex];
    if (!track) return;
    
    const shareUrl = generateShareUrl(track);
    const text = `🎵 Listen to "${track.title}" on ORBIT — AI-powered music\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}

function shareToTwitter() {
    const track = state.tracks[state.currentTrackIndex];
    if (!track) return;
    
    const shareUrl = generateShareUrl(track);
    const text = `🎵 Listening to "${track.title}" on ORBIT — music created through AI imagination`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
}

function copyShareLink() {
    if (!elements.shareLinkInput) return;
    
    navigator.clipboard.writeText(elements.shareLinkInput.value).then(() => {
        if (elements.shareCopied) {
            elements.shareCopied.classList.add('show');
            setTimeout(() => {
                elements.shareCopied.classList.remove('show');
            }, 2000);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback
        elements.shareLinkInput.select();
        document.execCommand('copy');
    });
}

function checkUrlForSong() {
    const urlParams = new URLSearchParams(window.location.search);
    const songId = urlParams.get('song');
    
    if (songId && state.tracks.length > 0) {
        const songIndex = state.tracks.findIndex(t => t.id === songId || t.id === parseInt(songId));
        if (songIndex !== -1) {
            return songIndex;
        }
    }
    return null;
}

// ========================================
// EVENT LISTENERS
// ========================================

function initEventListeners() {
    // Play/Pause button
    elements.playPauseBtn.addEventListener('click', togglePlayPause);

    // Skip button
    elements.skipBtn.addEventListener('click', skipTrack);

    // Lyrics toggle - open modal instead
    elements.lyricsToggle.addEventListener('click', openLyricsModal);
    
    // Lyrics modal close
    if (elements.lyricsModalClose) {
        elements.lyricsModalClose.addEventListener('click', closeLyricsModal);
    }
    
    // Close modal on backdrop click
    if (elements.lyricsModal) {
        elements.lyricsModal.querySelector('.lyrics-modal-backdrop')?.addEventListener('click', closeLyricsModal);
    }

    // Audio ended - auto skip
    elements.audioPlayer.addEventListener('ended', () => {
        skipTrack();
    });

    // Audio error handling
    elements.audioPlayer.addEventListener('error', () => {
        console.log('Audio error, skipping to next track...');
        skipTrack();
    });
    
    // Second audio player events (for crossfade)
    if (elements.audioPlayerB) {
        elements.audioPlayerB.addEventListener('ended', () => {
            skipTrack();
        });
        
        elements.audioPlayerB.addEventListener('error', () => {
            console.log('Audio B error, skipping to next track...');
            skipTrack();
        });
    }

    // Click anywhere on jukebox disc to play/pause
    elements.jukebox.querySelector('.disc-container').addEventListener('click', togglePlayPause);
}

// ========================================
// PAGE TRANSITIONS
// ========================================

function initPageTransitions() {
    // Add transition class to all internal links
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        
        // Only for internal links (not external or anchor links)
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Fade out
                document.body.style.opacity = '0';
                document.body.style.transform = 'translateY(-10px)';
                document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================

async function init() {
    // Load tracks from Supabase or use fallback
    state.tracks = await loadTracksFromSupabase();

    // Hide loading screen
    hideLoadingScreen();

    if (state.tracks.length === 0) {
        elements.currentSongTitle.textContent = 'No tracks available';
        elements.songTitle.textContent = 'No tracks available';
        elements.songTheme.textContent = '—';
        elements.songSummary.textContent = 'Check back soon for new music.';
        return;
    }

    // Check URL for shared song
    const sharedSongIndex = checkUrlForSong();
    const initialTrack = sharedSongIndex !== null ? sharedSongIndex : getRandomTrackIndex();
    loadTrack(initialTrack);

    // Set up event listeners
    initEventListeners();
    
    // Initialize progress bar
    initProgressBar();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Initialize mobile gestures
    initMobileGestures();
    
    // Initialize page transitions
    initPageTransitions();
    
    // Initialize share modal
    initShareModal();

    // Show initial state
    elements.jukebox.classList.add('paused');

    // Auto-play if coming from shared link
    if (sharedSongIndex !== null) {
        setTimeout(() => {
            play();
        }, 500);
        return;
    }

    // Attempt autoplay
    const startOnInteraction = () => {
        if (!state.isInitialized) {
            play();
        }
        document.removeEventListener('click', startOnInteraction);
    };

    setTimeout(() => {
        if (!state.isPlaying) {
            document.addEventListener('click', startOnInteraction);
        }
    }, 1000);
}

// Start the jukebox
document.addEventListener('DOMContentLoaded', init);
