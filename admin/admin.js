/* ========================================
   ORBIT Admin — Dashboard Controller
   ======================================== */

// ========================================
// STATE
// ========================================

let currentUser = null;
let songs = [];
let deleteTarget = { id: null, audioUrl: null };

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    // User & Auth
    adminUser: document.getElementById('adminUser'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Stats
    totalSongs: document.getElementById('totalSongs'),
    publishedSongs: document.getElementById('publishedSongs'),
    draftSongs: document.getElementById('draftSongs'),
    
    // Library
    songsTableBody: document.getElementById('songsTableBody'),
    emptyState: document.getElementById('emptyState'),
    refreshBtn: document.getElementById('refreshBtn'),
    
    // Upload Form
    uploadForm: document.getElementById('uploadForm'),
    audioFile: document.getElementById('audioFile'),
    fileUploadArea: document.getElementById('fileUploadArea'),
    fileUploadText: document.getElementById('fileUploadText'),
    songTitle: document.getElementById('songTitle'),
    songTheme: document.getElementById('songTheme'),
    songSummary: document.getElementById('songSummary'),
    songLyrics: document.getElementById('songLyrics'),
    publishToggle: document.getElementById('publishToggle'),
    uploadProgress: document.getElementById('uploadProgress'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    uploadBtn: document.getElementById('uploadBtn'),
    // Cover upload elements
    coverFile: document.getElementById('coverFile'),
    coverUploadArea: document.getElementById('coverUploadArea'),
    coverUploadText: document.getElementById('coverUploadText'),
    coverPreview: document.getElementById('coverPreview'),
    coverPreviewImg: document.getElementById('coverPreviewImg'),
    removeCover: document.getElementById('removeCover'),
    
    // Edit Modal
    editModal: document.getElementById('editModal'),
    editForm: document.getElementById('editForm'),
    editSongId: document.getElementById('editSongId'),
    editTitle: document.getElementById('editTitle'),
    editTheme: document.getElementById('editTheme'),
    editSummary: document.getElementById('editSummary'),
    editLyrics: document.getElementById('editLyrics'),
    editPublished: document.getElementById('editPublished'),
    modalClose: document.getElementById('modalClose'),
    cancelEdit: document.getElementById('cancelEdit'),
    // Edit cover elements
    editCurrentCoverUrl: document.getElementById('editCurrentCoverUrl'),
    editCoverFile: document.getElementById('editCoverFile'),
    editCoverPreviewImg: document.getElementById('editCoverPreviewImg'),
    editCoverPlaceholder: document.getElementById('editCoverPlaceholder'),
    editRemoveCover: document.getElementById('editRemoveCover'),
    
    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteSongTitle: document.getElementById('deleteSongTitle'),
    deleteSongId: document.getElementById('deleteSongId'),
    deleteAudioUrl: document.getElementById('deleteAudioUrl'),
    cancelDelete: document.getElementById('cancelDelete'),
    confirmDelete: document.getElementById('confirmDelete'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuth() {
    if (!window.orbitSupabase) {
        elements.songsTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6">Admin unavailable: Supabase client not initialized.</td>
            </tr>
        `;
        showToast('Supabase client not initialized. Check server config.', 'error');
        return;
    }

    try {
        const { data: { session }, error } = await orbitSupabase.auth.getSession();

        if (!session) {
            window.location.href = '/admin/index.html';
            return;
        }

        currentUser = session.user;
        elements.adminUser.textContent = currentUser.email;

        // Load songs after auth check
        await loadSongs();
    } catch (e) {
        console.error('Auth check failed:', e);
        elements.songsTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6">Failed to verify auth. Please refresh.</td>
            </tr>
        `;
        showToast('Failed to verify auth. See console.', 'error');
    }
}

async function logout() {
    const { error } = await orbitSupabase.auth.signOut();
    if (!error) {
        window.location.href = '/';
    }
}

// ========================================
// SONGS CRUD
// ========================================

async function loadSongs() {
    elements.songsTableBody.innerHTML = `
        <tr class="loading-row">
            <td colspan="6">
                <div class="loading-spinner"></div>
                Loading songs...
            </td>
        </tr>
    `;
    
    try {
        const { data, error } = await orbitSupabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        songs = data || [];
        renderSongs();
        updateStats();
    } catch (error) {
        console.error('Error loading songs:', error);
        showToast('Failed to load songs', 'error');
        elements.songsTableBody.innerHTML = `
            <tr class="loading-row">
                <td colspan="6">Failed to load songs. Please refresh.</td>
            </tr>
        `;
    }
}

function renderSongs() {
    if (songs.length === 0) {
        elements.songsTableBody.innerHTML = '';
        elements.emptyState.style.display = 'block';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    elements.songsTableBody.innerHTML = songs.map(song => `
        <tr data-id="${song.id}">
            <td class="song-cover-cell">
                ${song.cover_url 
                    ? `<img src="${song.cover_url}" alt="${escapeHtml(song.title)}" class="table-cover">`
                    : `<div class="table-cover-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>`
                }
            </td>
            <td class="song-title-cell">${escapeHtml(song.title)}</td>
            <td class="song-theme-cell">${escapeHtml(song.theme || '—')}</td>
            <td class="summary-preview">${escapeHtml(song.summary?.substring(0, 40) || '—')}${song.summary?.length > 40 ? '...' : ''}</td>
            <td>
                <span class="status-badge ${song.published ? 'published' : 'draft'}">
                    ${song.published ? 'Published' : 'Draft'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action edit" title="Edit" onclick="openEditModal('${song.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-action delete" title="Delete" onclick="openDeleteModal('${song.id}', '${escapeHtml(song.title)}', '${song.audio_url}', '${song.cover_url || ''}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStats() {
    const total = songs.length;
    const published = songs.filter(s => s.published).length;
    const drafts = total - published;
    
    elements.totalSongs.textContent = total;
    elements.publishedSongs.textContent = published;
    elements.draftSongs.textContent = drafts;
}

// ========================================
// UPLOAD
// ========================================

async function uploadSong(e) {
    e.preventDefault();
    
    const file = elements.audioFile.files[0];
    if (!file) {
        showToast('Please select an audio file', 'error');
        return;
    }
    
    const title = elements.songTitle.value.trim();
    const theme = elements.songTheme.value.trim();
    const summary = elements.songSummary.value.trim();
    const lyrics = elements.songLyrics.value.trim();
    const published = elements.publishToggle.checked;
    const coverFile = elements.coverFile.files[0];
    
    if (!title) {
        showToast('Please enter a song title', 'error');
        return;
    }
    
    // Show progress
    elements.uploadProgress.style.display = 'block';
    elements.uploadBtn.disabled = true;
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = 'Uploading audio...';
    
    try {
        // Generate unique filename for audio
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `songs/${fileName}`;
        
        // Upload audio to Supabase Storage
        elements.progressFill.style.width = '20%';
        
        const { data: uploadData, error: uploadError } = await orbitSupabase.storage
            .from('audio')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) throw uploadError;
        
        // Get public URL for audio
        const { data: { publicUrl: audioUrl } } = orbitSupabase.storage
            .from('audio')
            .getPublicUrl(filePath);
        
        // Upload cover if provided
        let coverUrl = null;
        if (coverFile) {
            elements.progressFill.style.width = '40%';
            elements.progressText.textContent = 'Uploading cover art...';
            
            const coverExt = coverFile.name.split('.').pop();
            const coverFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
            const coverPath = `covers/${coverFileName}`;
            
            const { data: coverUploadData, error: coverUploadError } = await orbitSupabase.storage
                .from('audio')
                .upload(coverPath, coverFile, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (coverUploadError) {
                console.warn('Cover upload warning:', coverUploadError);
            } else {
                const { data: { publicUrl } } = orbitSupabase.storage
                    .from('audio')
                    .getPublicUrl(coverPath);
                coverUrl = publicUrl;
            }
        }
        
        elements.progressFill.style.width = '70%';
        elements.progressText.textContent = 'Saving metadata...';
        
        // Insert song metadata
        const { data: songData, error: insertError } = await orbitSupabase
            .from('songs')
            .insert({
                title,
                theme,
                summary,
                lyrics,
                audio_url: audioUrl,
                cover_url: coverUrl,
                published
            })
            .select()
            .single();
        
        if (insertError) throw insertError;
        
        elements.progressFill.style.width = '100%';
        elements.progressText.textContent = 'Complete!';
        
        // Reset form
        setTimeout(() => {
            elements.uploadForm.reset();
            elements.fileUploadArea.classList.remove('has-file');
            elements.fileUploadText.textContent = 'Drop audio file or click to browse';
            elements.coverUploadArea.classList.remove('has-file');
            elements.coverUploadText.textContent = 'Drop cover image or click to browse';
            elements.coverPreview.style.display = 'none';
            elements.uploadProgress.style.display = 'none';
            elements.uploadBtn.disabled = false;
        }, 1000);
        
        showToast('Song uploaded successfully!', 'success');
        
        // Reload songs
        await loadSongs();
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast(error.message || 'Failed to upload song', 'error');
        elements.uploadProgress.style.display = 'none';
        elements.uploadBtn.disabled = false;
    }
}

// ========================================
// EDIT
// ========================================

let editCoverChanged = false;
let editCoverRemoved = false;

function openEditModal(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;
    
    elements.editSongId.value = song.id;
    elements.editTitle.value = song.title;
    elements.editTheme.value = song.theme || '';
    elements.editSummary.value = song.summary || '';
    elements.editLyrics.value = song.lyrics || '';
    elements.editPublished.checked = song.published;
    elements.editCurrentCoverUrl.value = song.cover_url || '';
    
    // Reset cover state
    editCoverChanged = false;
    editCoverRemoved = false;
    elements.editCoverFile.value = '';
    
    // Show current cover or placeholder
    if (song.cover_url) {
        elements.editCoverPreviewImg.src = song.cover_url;
        elements.editCoverPreviewImg.style.display = 'block';
        elements.editCoverPlaceholder.style.display = 'none';
    } else {
        elements.editCoverPreviewImg.style.display = 'none';
        elements.editCoverPlaceholder.style.display = 'flex';
    }
    
    elements.editModal.classList.add('active');
}

function closeEditModal() {
    elements.editModal.classList.remove('active');
}

async function saveEdit(e) {
    e.preventDefault();
    
    const id = elements.editSongId.value;
    const title = elements.editTitle.value.trim();
    const theme = elements.editTheme.value.trim();
    const summary = elements.editSummary.value.trim();
    const lyrics = elements.editLyrics.value.trim();
    const published = elements.editPublished.checked;
    const currentCoverUrl = elements.editCurrentCoverUrl.value;
    const newCoverFile = elements.editCoverFile.files[0];
    
    if (!title) {
        showToast('Please enter a song title', 'error');
        return;
    }
    
    try {
        let coverUrl = currentCoverUrl;
        
        // Handle cover changes
        if (editCoverRemoved) {
            // Delete old cover from storage
            if (currentCoverUrl) {
                const urlParts = currentCoverUrl.split('/storage/v1/object/public/audio/');
                if (urlParts.length > 1) {
                    await orbitSupabase.storage.from('audio').remove([urlParts[1]]);
                }
            }
            coverUrl = null;
        } else if (newCoverFile) {
            // Upload new cover
            const coverExt = newCoverFile.name.split('.').pop();
            const coverFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${coverExt}`;
            const coverPath = `covers/${coverFileName}`;
            
            const { error: coverUploadError } = await orbitSupabase.storage
                .from('audio')
                .upload(coverPath, newCoverFile, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (coverUploadError) throw coverUploadError;
            
            // Delete old cover if exists
            if (currentCoverUrl) {
                const urlParts = currentCoverUrl.split('/storage/v1/object/public/audio/');
                if (urlParts.length > 1) {
                    await orbitSupabase.storage.from('audio').remove([urlParts[1]]);
                }
            }
            
            const { data: { publicUrl } } = orbitSupabase.storage
                .from('audio')
                .getPublicUrl(coverPath);
            coverUrl = publicUrl;
        }
        
        const { error } = await orbitSupabase
            .from('songs')
            .update({ title, theme, summary, lyrics, cover_url: coverUrl, published })
            .eq('id', id);
        
        if (error) throw error;
        
        closeEditModal();
        showToast('Song updated successfully!', 'success');
        await loadSongs();
        
    } catch (error) {
        console.error('Update error:', error);
        showToast(error.message || 'Failed to update song', 'error');
    }
}

// ========================================
// DELETE
// ========================================

let deleteCoverUrl = '';

function openDeleteModal(id, title, audioUrl, coverUrl) {
    elements.deleteSongId.value = id;
    elements.deleteAudioUrl.value = audioUrl;
    deleteCoverUrl = coverUrl || '';
    elements.deleteSongTitle.textContent = title;
    elements.deleteModal.classList.add('active');
}

function closeDeleteModal() {
    elements.deleteModal.classList.remove('active');
}

async function confirmDeleteSong() {
    const id = elements.deleteSongId.value;
    const audioUrl = elements.deleteAudioUrl.value;
    
    try {
        // Extract file path from audio URL and delete
        const audioUrlParts = audioUrl.split('/storage/v1/object/public/audio/');
        const audioFilePath = audioUrlParts.length > 1 ? audioUrlParts[1] : null;
        
        if (audioFilePath) {
            const { error: storageError } = await orbitSupabase.storage
                .from('audio')
                .remove([audioFilePath]);
            
            if (storageError) {
                console.warn('Audio storage delete warning:', storageError);
            }
        }
        
        // Delete cover from storage if exists
        if (deleteCoverUrl) {
            const coverUrlParts = deleteCoverUrl.split('/storage/v1/object/public/audio/');
            const coverFilePath = coverUrlParts.length > 1 ? coverUrlParts[1] : null;
            
            if (coverFilePath) {
                const { error: coverStorageError } = await orbitSupabase.storage
                    .from('audio')
                    .remove([coverFilePath]);
                
                if (coverStorageError) {
                    console.warn('Cover storage delete warning:', coverStorageError);
                }
            }
        }
        
        // Delete from database
        const { error: dbError } = await orbitSupabase
            .from('songs')
            .delete()
            .eq('id', id);
        
        if (dbError) throw dbError;
        
        closeDeleteModal();
        showToast('Song deleted successfully!', 'success');
        await loadSongs();
        
    } catch (error) {
        console.error('Delete error:', error);
        showToast(error.message || 'Failed to delete song', 'error');
    }
}

// ========================================
// UTILITIES
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type} visible`;
    
    setTimeout(() => {
        elements.toast.classList.remove('visible');
    }, 3000);
}

// ========================================
// FILE UPLOAD DRAG & DROP
// ========================================

function setupFileUpload() {
    // Audio file upload
    const audioArea = elements.fileUploadArea;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        audioArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        audioArea.addEventListener(eventName, () => {
            audioArea.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        audioArea.addEventListener(eventName, () => {
            audioArea.classList.remove('dragover');
        });
    });
    
    audioArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            elements.audioFile.files = files;
            handleFileSelect();
        }
    });
    
    elements.audioFile.addEventListener('change', handleFileSelect);
    
    // Cover file upload
    setupCoverUpload();
}

function setupCoverUpload() {
    const coverArea = elements.coverUploadArea;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        coverArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        coverArea.addEventListener(eventName, () => {
            coverArea.classList.add('dragover');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        coverArea.addEventListener(eventName, () => {
            coverArea.classList.remove('dragover');
        });
    });
    
    coverArea.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            elements.coverFile.files = files;
            handleCoverSelect();
        }
    });
    
    elements.coverFile.addEventListener('change', handleCoverSelect);
    elements.removeCover.addEventListener('click', removeCoverPreview);
    
    // Edit modal cover handling
    elements.editCoverFile.addEventListener('change', handleEditCoverSelect);
    elements.editRemoveCover.addEventListener('click', removeEditCover);
}

function handleFileSelect() {
    const file = elements.audioFile.files[0];
    if (file) {
        elements.fileUploadArea.classList.add('has-file');
        elements.fileUploadText.textContent = file.name;
    } else {
        elements.fileUploadArea.classList.remove('has-file');
        elements.fileUploadText.textContent = 'Drop audio file or click to browse';
    }
}

function handleCoverSelect() {
    const file = elements.coverFile.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.coverPreviewImg.src = e.target.result;
            elements.coverPreview.style.display = 'flex';
            elements.coverUploadArea.classList.add('has-file');
        };
        reader.readAsDataURL(file);
    }
}

function removeCoverPreview() {
    elements.coverFile.value = '';
    elements.coverPreview.style.display = 'none';
    elements.coverUploadArea.classList.remove('has-file');
    elements.coverUploadText.textContent = 'Drop cover image or click to browse';
}

function handleEditCoverSelect() {
    const file = elements.editCoverFile.files[0];
    if (file) {
        editCoverChanged = true;
        editCoverRemoved = false;
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.editCoverPreviewImg.src = e.target.result;
            elements.editCoverPreviewImg.style.display = 'block';
            elements.editCoverPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function removeEditCover() {
    editCoverRemoved = true;
    editCoverChanged = false;
    elements.editCoverFile.value = '';
    elements.editCoverPreviewImg.style.display = 'none';
    elements.editCoverPlaceholder.style.display = 'flex';
}

// ========================================
// EVENT LISTENERS
// ========================================

function initEventListeners() {
    // Logout
    elements.logoutBtn.addEventListener('click', logout);
    
    // Refresh
    elements.refreshBtn.addEventListener('click', loadSongs);
    
    // Upload form
    elements.uploadForm.addEventListener('submit', uploadSong);
    
    // Edit modal
    elements.editForm.addEventListener('submit', saveEdit);
    elements.modalClose.addEventListener('click', closeEditModal);
    elements.cancelEdit.addEventListener('click', closeEditModal);
    elements.editModal.querySelector('.modal-overlay').addEventListener('click', closeEditModal);
    
    // Delete modal
    elements.cancelDelete.addEventListener('click', closeDeleteModal);
    elements.confirmDelete.addEventListener('click', confirmDeleteSong);
    elements.deleteModal.querySelector('.modal-overlay').addEventListener('click', closeDeleteModal);
    
    // File upload
    setupFileUpload();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
            closeDeleteModal();
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkAuth();
});

// Make functions globally accessible for inline onclick handlers
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
