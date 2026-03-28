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
    renderHome();
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
    nowPlaying.textContent = track.name;

    // Update Media Session metadata
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name,
            artist: currentAlbumTracks[index].artist || "Unknown Artist",
            album: currentAlbumTracks[index].album || "Untitled Album",
            artwork: [
                { src: "/untitled123111/icon-192.png", sizes: "192x192", type: "image/png" }
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
    if (albumId === currentAlbumId) goHome();

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
          title.textContent = album.name;

          renderTracks(album);
      };
}

function goHome() {
    document.getElementById("albumPage").style.display = "none";
    document.getElementById("home").style.display = "grid";
    renderHome();
    currentAlbumId = null;
}

// ================== TRACK MANAGEMENT ==================
function renderTracks(album) {
    const list = document.getElementById("trackList");
    list.innerHTML = "";

    album.tracks.forEach((track, index) => {
        const div = document.createElement("div");
        div.className = "track";
        div.textContent = `${index + 1}. ${track.name}`;
        div.onclick = () => playTrack(index);
        list.appendChild(div);
    });
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
    navigator.serviceWorker.register("/untitled123111/service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.log("Service Worker failed:", err));
}