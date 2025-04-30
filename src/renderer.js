const list = document.getElementById('music-list');

let currentTrackIndex = -1;
let trackList = [];

const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const timeDisplay = document.getElementById('time-display');


function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }


document.getElementById('select-folder').addEventListener('click', async () => {
  const folderTree = await window.electronAPI.selectFolder();
  list.innerHTML = '';
  renderFolder(folderTree, list);
});

function renderFolder(tree, parent) {
  Object.entries(tree).forEach(([name, value]) => {
    if (typeof value === 'string') {
        if (typeof value === 'string') {
            const li = document.createElement('li');
            li.textContent = name;
            li.style.cursor = 'pointer';
          
            const trackIndex = trackList.length;
            trackList.push({ name, path: value });
          
            li.addEventListener('click', () => {
              playTrack(trackIndex);
            });
          
            parent.appendChild(li);
          }
          
    } else {
      // It's a folder
      const folderLi = document.createElement('li');
      const folderToggle = document.createElement('div');
      folderToggle.textContent = `📁 ${name}`;
      folderToggle.style.cursor = 'pointer';

      const subList = document.createElement('ul');
      subList.style.display = 'none';
      renderFolder(value, subList);

      folderToggle.addEventListener('click', () => {
        subList.style.display = subList.style.display === 'none' ? 'block' : 'none';
      });

      folderLi.appendChild(folderToggle);
      folderLi.appendChild(subList);
      parent.appendChild(folderLi);
    }
  });
}

const audio = document.getElementById('player');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const trackTitle = document.getElementById('current-track');

function playTrack(index) {
  if (trackList.length === 0 || index < 0 || index >= trackList.length) return;
  currentTrackIndex = index;
  audio.src = trackList[index].path;
  trackTitle.textContent = trackList[index].name;
  playBtn.textContent = '⏸️';

  audio.pause(); // Pause any ongoing playback
  audio.load(); // Ensure the new source is loaded
  audio.addEventListener('canplay', () => {
    audio.play().catch((error) => {
      console.error('Playback failed:', error);
    });
  }, { once: true }); // Add a one-time event listener for 'canplay'
}

playBtn.addEventListener('click', () => {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
    playBtn.textContent = '⏸️';
  } else {
    audio.pause();
    playBtn.textContent = '▶️';
  }
});

prevBtn.addEventListener('click', () => {
  if (currentTrackIndex > 0) playTrack(currentTrackIndex - 1);
});

nextBtn.addEventListener('click', () => {
  if (currentTrackIndex < trackList.length - 1) playTrack(currentTrackIndex + 1);
});

audio.addEventListener('ended', () => {
  if (repeatMode) {
    audio.currentTime = 0; // Reset the current track to the beginning
    audio.play(); // Replay the current track
  } else if (currentTrackIndex < trackList.length - 1) {
    playTrack(currentTrackIndex + 1); // Play the next track
  } else {
    playBtn.textContent = '▶️'; // Reset play button icon when playback ends
  }
});

audio.preload = "auto";
audio.crossOrigin = "anonymous"; // Enable cross-origin for better compatibility
audio.setAttribute('playsinline', ''); // Prevents fullscreen on mobile devices
audio.setAttribute('controlsList', 'nodownload'); // Disable download option

document.getElementById('reset-folder').addEventListener('click', async () => {
    await window.electronAPI.resetFolder();
    document.getElementById('music-list').innerHTML = '';
    trackList = [];
    currentTrackIndex = -1;
    trackTitle.textContent = 'No track selected';
  });
  

audio.addEventListener('timeupdate', () => {
    const current = audio.currentTime;
    const total = audio.duration || 0;
    const percent = (current / total) * 100;
    progress.style.width = `${percent}%`;
    timeDisplay.textContent = `${formatTime(current)} / ${formatTime(total)}`;
  });
  progressBar.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audio.currentTime = percent * audio.duration;
  });
    
  window.addEventListener('DOMContentLoaded', async () => {
    const folderTree = await window.electronAPI.getLastFolder();
    if (Object.keys(folderTree).length > 0) {
      renderFolder(folderTree, list);
    }
  });
  const repeatBtn = document.getElementById('repeat');
  let repeatMode = false; // false: no repeat, true: repeat current track

repeatBtn.addEventListener('click', () => {
  repeatMode = !repeatMode;
  repeatBtn.classList.toggle('active', repeatMode); // Add 'active' class for visual indication
  repeatBtn.style.opacity = repeatMode ? '1' : '0.8'; // Adjust opacity based on state
  repeatBtn.textContent = repeatMode ? '🔂' : '🔁'; // Change icon based on state
});
