// ================== DATABASE ==================
let db;
let currentAlbumId = null;
let currentAlbumTracks = [];
let currentTrackIndex = -1;

const request = indexedDB.open("PiratedUntitledDB", 1);

request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("albums")) {
        db.createObjectStore("albums", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
    }
};

request.onsuccess = e => {
    db = e.target.result;
};

// ================== AUDIO PLAYER ==================
const audio = document.getElementById("audioPlayer");
const nowPlaying = document.getElementById("nowPlaying");

// Media Session API for background & lock screen controls
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => audio.play());
    navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
}

// Play track and update UI + media session
function playTrack(index) {
    const track = currentAlbumTracks[index];
    if (!track) return;

    currentTrackIndex = index;
    audio.src = track.url;
    audio.play();
    nowPlaying.textContent = `${track.name}`;

    // Update Media Session metadata
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name,
            artist: track.artist || "Unknown Artist",
            album: track.album || "Untitled Album",
            artwork: [
                { src: "/icon-192.png", sizes: "192x192", type: "image/png" }
            ]
        });
    }
}

// Play next track in album
function playNext() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= currentAlbumTracks.length) nextIndex = 0;
    playTrack(nextIndex);
}

// Play previous track
function playPrevious() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = currentAlbumTracks.length - 1;
    playTrack(prevIndex);
}

// ================== ALBUM MANAGEMENT ==================
function getAllAlbums(cb) {
    db.transaction("albums", "readonly")
      .objectStore("albums")
      .getAll().onsuccess = e => cb(e.target.result);
}

function saveAlbum(album) {
    db.transaction("albums", "readwrite")
      .objectStore("albums")
      .put(album);
}

function createAlbum() {
    db.transaction("albums", "readwrite")
      .objectStore("albums")
      .add({ name: "Untitled Project", cover: null, tracks: [] })
      .onsuccess = renderHome;
}

function deleteAlbum(albumId) {
    db.transaction("albums", "readwrite")
      .objectStore("albums")
      .delete(albumId)
      .onsuccess = () => renderHome();
}

// ================== RENDERING ==================
function renderHome() {
    getAllAlbums(albums => {
        const home = document.getElementById("home");
        home.innerHTML = "";
        albums.forEach(album => {
            const card = document.createElement("div");
            card.className = "album-card";
            card.onclick = () => openAlbum(album.id);

            const img = document.createElement("img");
            img.src = album.cover || "";
            card.appendChild(img);

            const p = document.createElement("p");
            p.textContent = album.name;
            card.appendChild(p);

            home.appendChild(card);
        });
    });
}

function openAlbum(albumId) {
    currentAlbumId = albumId;
    document.getElementById("home").style.display = "none";
    document.getElementById("albumPage").style.display = "block";

    db.transaction("albums", "readonly")
      .objectStore("albums")
      .get(albumId).onsuccess = e => {
          const album = e.target.result;
          currentAlbumTracks = album.tracks;

          const title = document.getElementById("albumTitle");
          title.value = album.name;

          renderTracks(album);
      };
}

function goHome() {
    document.getElementById("albumPage").style.display = "none";
    document.getElementById("home").style.display = "grid";
    renderHome();
    currentAlbumId = null;
}

function saveAlbumTitle() {
    const newTitle = document.getElementById("albumTitle").value;

    if (!newTitle.trim()) {
        alert("Title cannot be empty");
        return;
    }

    db.transaction("albums", "readwrite")
      .objectStore("albums")
      .get(currentAlbumId).onsuccess = e => {
          const album = e.target.result;
          album.name = newTitle;
          saveAlbum(album);
          renderHome();
      };
}

function deleteCurrentAlbum() {
    if (confirm("Delete this album?")) {
        deleteAlbum(currentAlbumId);
        goHome();
    }
}

// ================== TRACK MANAGEMENT ==================
let trackMenu = null;
let activeMenuTrackIndex = null;

function renderTracks(album) {
    const list = document.getElementById("trackList");
    list.innerHTML = "";
    closeTrackMenu();

    album.tracks.forEach((track, index) => {
        const div = document.createElement("div");
        div.className = "track";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = `${index + 1}. ${track.name}`;
        titleSpan.onclick = e => {
            e.stopPropagation();
            playTrack(index);
        };
        div.appendChild(titleSpan);

        const optionsBtn = document.createElement("button");
        optionsBtn.className = "track-options";
        optionsBtn.setAttribute("aria-label", "Track options");
        optionsBtn.textContent = "⋮";
        optionsBtn.onclick = e => {
            e.stopPropagation();
            openTrackMenu(index, optionsBtn);
        };
        div.appendChild(optionsBtn);

        list.appendChild(div);
    });
}

function openTrackMenu(index, button) {
    closeTrackMenu();
    activeMenuTrackIndex = index;

    const track = currentAlbumTracks[index];
    if (!track) return;

    const menu = document.createElement("div");
    menu.className = "track-menu";
    menu.innerHTML = `
        <h4>${track.name}</h4>
        <div class="position-info">Track ${index + 1} of ${currentAlbumTracks.length}</div>
        <button class="menu-btn" onclick="renameCurrentTrack(event)">Rename</button>
        <button class="menu-btn delete-btn" onclick="deleteCurrentTrack(event)">Delete</button>
    `;

    document.body.appendChild(menu);
    const rect = button.getBoundingClientRect();
    menu.style.position = "absolute";
    menu.style.top = `${rect.bottom + 6 + window.scrollY}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;

    trackMenu = menu;
}

function closeTrackMenu() {
    if (trackMenu) {
        trackMenu.remove();
        trackMenu = null;
        activeMenuTrackIndex = null;
    }
}

window.addEventListener("click", e => {
    if (!e.target.closest(".track-menu") && !e.target.classList.contains("track-options")) {
        closeTrackMenu();
    }
});

function renameCurrentTrack(event) {
    event.stopPropagation();
    if (activeMenuTrackIndex === null) return;

    const newName = prompt("Rename track:", currentAlbumTracks[activeMenuTrackIndex].name);
    if (!newName || !newName.trim()) return;

    currentAlbumTracks[activeMenuTrackIndex].name = newName.trim();
    saveCurrentAlbumTracks();
    renderTracks({ tracks: currentAlbumTracks });
    closeTrackMenu();
}

function deleteCurrentTrack(event) {
    event.stopPropagation();
    if (activeMenuTrackIndex === null) return;

    if (!confirm("Delete this track?")) return;

    currentAlbumTracks.splice(activeMenuTrackIndex, 1);
    saveCurrentAlbumTracks();
    renderTracks({ tracks: currentAlbumTracks });
    closeTrackMenu();
}

function saveCurrentAlbumTracks() {
    if (!currentAlbumId) return;
    db.transaction("albums", "readwrite")
      .objectStore("albums")
      .get(currentAlbumId).onsuccess = e => {
          const album = e.target.result;
          album.tracks = currentAlbumTracks;
          saveAlbum(album);
      };
}

function addSongs() {
    const files = document.getElementById("songUpload").files;
    if (!files.length) return;

    db.transaction("albums", "readwrite")
      .objectStore("albums")
      .get(currentAlbumId).onsuccess = e => {
          const album = e.target.result;
          for (let file of files) {
              album.tracks.push({
                  name: file.name,
                  url: URL.createObjectURL(file)
              });
          }
          saveAlbum(album);
          openAlbum(currentAlbumId);
      };
}

// ================== SERVICE WORKER ==================
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.log("Service Worker failed:", err));
}
