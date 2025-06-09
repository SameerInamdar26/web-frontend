// Wait for DOM load
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = 'https://web-backend-ee9n.onrender.com';

  // Get video id from query params
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('id') || 'default';

  // Fetch video data from Flask API
  function fetchVideoData(id) {
    return fetch(`${BACKEND_URL}/api/videos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch video data');
        return res.json();
      });
  }

  // Fetch suggested videos from Flask API
  function fetchSuggestedVideos() {
    return fetch(`${BACKEND_URL}/api/videos/suggested`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch suggested videos');
        return res.json();
      });
  }

  // Render video player and info
  function renderVideo(video) {
    const container = document.getElementById('videoContainer');
    container.innerHTML = '';

    if (video.isEmbed) {
      const iframe = document.createElement('iframe');
      iframe.src = video.src;
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    } else {
      const videoElem = document.createElement('video');
      videoElem.src = video.src;
      videoElem.controls = true;
      videoElem.poster = video.thumbnail || '';
      container.appendChild(videoElem);
    }

    // Update info
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoDescription').textContent = video.description;
    document.getElementById('likeCount').textContent = video.likes.toLocaleString();
    document.getElementById('dislikeCount').textContent =
      video.dislikes.toLocaleString();
    document.getElementById('viewsCount').textContent = `${formatViews(
      video.views
    )} views`;
  }

  // Format views count e.g. 1000 -> 1K, 1500000 -> 1.5M
  function formatViews(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num;
  }

  // Render suggested videos list
  function renderSuggestedVideos(videos) {
    const list = document.getElementById('suggestedVideosList');
    list.innerHTML = '';

    videos.forEach(vid => {
      const li = document.createElement('li');

      li.innerHTML = `
        <img src="${vid.thumbnail}" alt="Thumbnail of ${vid.title}" />
        <div class="video-meta">
          <div class="title">${vid.title}</div>
          <div class="views">${formatViews(vid.views)} views</div>
        </div>
      `;

      li.addEventListener('click', () => {
        window.location.href = `video.html?id=${vid.id}`;
      });

      list.appendChild(li);
    });
  }

  // Like & Dislike button logic with animation and toggle
  const likeBtn = document.getElementById('likeBtn');
  const dislikeBtn = document.getElementById('dislikeBtn');
  let liked = false;
  let disliked = false;

  function animateButton(button) {
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 500);
  }

  likeBtn.addEventListener('click', () => {
    if (liked) {
      liked = false;
      updateCount('likeCount', -1);
      likeBtn.classList.remove('active');
    } else {
      liked = true;
      updateCount('likeCount', 1);
      animateButton(likeBtn);

      if (disliked) {
        disliked = false;
        updateCount('dislikeCount', -1);
        dislikeBtn.classList.remove('active');
      }
    }
  });

  dislikeBtn.addEventListener('click', () => {
    if (disliked) {
      disliked = false;
      updateCount('dislikeCount', -1);
      dislikeBtn.classList.remove('active');
    } else {
      disliked = true;
      updateCount('dislikeCount', 1);
      animateButton(dislikeBtn);

      if (liked) {
        liked = false;
        updateCount('likeCount', -1);
        likeBtn.classList.remove('active');
      }
    }
  });

  function updateCount(id, delta) {
    const elem = document.getElementById(id);
    let current = parseInt(elem.textContent.replace(/,/g, '')) || 0;
    current += delta;
    elem.textContent = current.toLocaleString();
  }

  // Share button: copies URL to clipboard
  const shareBtn = document.getElementById('shareBtn');
  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Video URL copied to clipboard!');
    });
  });

  // Initialize page: fetch video data and suggested videos then render
  fetchVideoData(videoId)
    .then(renderVideo)
    .catch(() => {
      alert('Failed to load video data');
    });

  fetchSuggestedVideos()
    .then(renderSuggestedVideos)
    .catch(() => {
      alert('Failed to load suggested videos');
    });
});
