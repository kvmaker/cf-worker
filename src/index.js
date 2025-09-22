const DEFAULT_PLAYLIST = [
  {
    id: "track-1",
    title: "Morning Dew",
    artist: "Ember Collective",
    cover: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=600&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2021/09/08/audio_0a5bd7b61b.mp3?filename=deep-meditation-6396.mp3"
  },
  {
    id: "track-2",
    title: "City Lights",
    artist: "Midnight Transit",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_3315ad723e.mp3?filename=midnight-stroll-203865.mp3"
  },
  {
    id: "track-3",
    title: "Golden Hour",
    artist: "Lakeside Drive",
    cover: "https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=600&q=80",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_e8f3dfb0aa.mp3?filename=summer-walk-203867.mp3"
  }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/playlist")) {
      if (request.method === "GET") {
        const playlist = await getPlaylist(env);
        return jsonResponse(playlist);
      }

      if (request.method === "PUT") {
        if (!env.PLAYLIST) {
          return new Response(JSON.stringify({
            error: "Playlist storage is not configured. Add a KV namespace binding named PLAYLIST."
          }), {
            status: 500,
            headers: {
              "content-type": "application/json"
            }
          });
        }

        const incoming = await request.json();
        await env.PLAYLIST.put("tracks", JSON.stringify(incoming));
        return jsonResponse({ ok: true });
      }

      return new Response("Method Not Allowed", { status: 405 });
    }

    return new Response(renderHtml(), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};

async function getPlaylist(env) {
  if (env.PLAYLIST) {
    try {
      const stored = await env.PLAYLIST.get("tracks", { type: "json" });
      if (stored && Array.isArray(stored)) {
        return stored;
      }
    } catch (error) {
      console.error("Unable to read playlist from KV", error);
    }
  }

  return DEFAULT_PLAYLIST;
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store"
    }
  });
}

function renderHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cloudflare 音乐播放器</title>
    <style>
      :root {
        color-scheme: light dark;
        --primary: #2563eb;
        --bg: #0f172a;
        --bg-panel: rgba(15, 23, 42, 0.85);
        --bg-playlist: rgba(30, 41, 59, 0.8);
        --text: #e2e8f0;
        --muted: #94a3b8;
        --border: rgba(148, 163, 184, 0.2);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background: linear-gradient(135deg, #1e293b, #0f172a 60%, #111827);
        color: var(--text);
      }

      main {
        width: min(960px, 95vw);
        height: 560px;
        display: grid;
        grid-template-columns: 2fr 1fr;
        background: rgba(15, 23, 42, 0.75);
        border-radius: 28px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border);
      }

      .player {
        display: flex;
        flex-direction: column;
        padding: 32px;
        gap: 32px;
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(30, 64, 175, 0.15));
      }

      .cover {
        width: 100%;
        flex: 1;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.15);
      }

      .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .info h2 {
        margin: 0;
        font-size: 1.75rem;
        letter-spacing: 0.02em;
      }

      .info p {
        margin: 0;
        color: var(--muted);
        font-weight: 500;
        letter-spacing: 0.05em;
      }

      .controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 24px;
      }

      button {
        background: none;
        border: none;
        color: var(--text);
        width: 56px;
        height: 56px;
        border-radius: 50%;
        font-size: 1.2rem;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: transform 0.2s ease, background 0.2s ease;
      }

      button:hover {
        background: rgba(37, 99, 235, 0.15);
        transform: translateY(-3px);
      }

      button.primary {
        background: var(--primary);
        color: white;
        width: 72px;
        height: 72px;
        font-size: 1.35rem;
        box-shadow: 0 10px 30px rgba(37, 99, 235, 0.35);
      }

      button.primary:hover {
        transform: translateY(-4px) scale(1.02);
      }

      .playlist {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.85));
        border-left: 1px solid var(--border);
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
      }

      .playlist h3 {
        margin: 0 0 16px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .playlist ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
      }

      .playlist li {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px;
        border-radius: 16px;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.2s ease;
        border: 1px solid transparent;
      }

      .playlist li:hover {
        background: rgba(37, 99, 235, 0.12);
        transform: translateY(-2px);
      }

      .playlist li.active {
        background: rgba(37, 99, 235, 0.2);
        border-color: rgba(37, 99, 235, 0.5);
      }

      .playlist li img {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        object-fit: cover;
      }

      .track-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .track-meta strong {
        font-size: 0.95rem;
      }

      .track-meta span {
        color: var(--muted);
        font-size: 0.8rem;
        letter-spacing: 0.05em;
      }

      @media (max-width: 960px) {
        main {
          grid-template-columns: 1fr;
          grid-template-rows: auto auto;
          height: auto;
        }

        .playlist {
          border-left: none;
          border-top: 1px solid var(--border);
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="player">
        <div class="cover">
          <img id="cover" src="" alt="封面" />
        </div>
        <div class="info">
          <h2 id="track-title">加载中...</h2>
          <p id="track-artist"></p>
        </div>
        <div class="controls">
          <button id="prev" aria-label="上一曲">&#xab;</button>
          <button id="play" class="primary" aria-label="播放或暂停">&#9654;</button>
          <button id="next" aria-label="下一曲">&#xbb;</button>
        </div>
      </section>
      <aside class="playlist">
        <h3>播放列表</h3>
        <ul id="playlist"></ul>
      </aside>
    </main>

    <audio id="audio" preload="metadata"></audio>

    <script>
      const audio = document.getElementById("audio");
      const coverEl = document.getElementById("cover");
      const titleEl = document.getElementById("track-title");
      const artistEl = document.getElementById("track-artist");
      const playBtn = document.getElementById("play");
      const prevBtn = document.getElementById("prev");
      const nextBtn = document.getElementById("next");
      const playlistEl = document.getElementById("playlist");

      let playlist = [];
      let currentIndex = 0;
      let isPlaying = false;

      fetch("/api/playlist")
        .then((res) => res.json())
        .then((tracks) => {
          playlist = tracks;
          renderPlaylist();
          if (playlist.length) {
            loadTrack(0);
          }
        })
        .catch(() => {
          titleEl.textContent = "无法加载播放列表";
          artistEl.textContent = "请稍后再试";
        });

      function renderPlaylist() {
        playlistEl.innerHTML = "";
        playlist.forEach((track, index) => {
          const li = document.createElement("li");
          li.innerHTML = \`
            <img src="${track.cover}" alt="${track.title}" />
            <div class="track-meta">
              <strong>${track.title}</strong>
              <span>${track.artist}</span>
            </div>
          \`;
          li.addEventListener("click", () => loadTrack(index, true));
          if (index === currentIndex) {
            li.classList.add("active");
          }
          playlistEl.appendChild(li);
        });
      }

      function loadTrack(index, autoPlay = false) {
        currentIndex = index;
        const track = playlist[index];
        if (!track) return;

        audio.src = track.audioUrl;
        coverEl.src = track.cover;
        coverEl.alt = track.title;
        titleEl.textContent = track.title;
        artistEl.textContent = track.artist;

        document.querySelectorAll(".playlist li").forEach((item, idx) => {
          item.classList.toggle("active", idx === index);
        });

        if (autoPlay || isPlaying) {
          playTrack();
        }
      }

      function playTrack() {
        audio
          .play()
          .then(() => {
            isPlaying = true;
            playBtn.innerHTML = "&#10074;&#10074;";
          })
          .catch((error) => {
            console.error("无法播放音频", error);
          });
      }

      function pauseTrack() {
        audio.pause();
        isPlaying = false;
        playBtn.innerHTML = "&#9654;";
      }

      playBtn.addEventListener("click", () => {
        if (!playlist.length) return;
        if (isPlaying) {
          pauseTrack();
        } else {
          playTrack();
        }
      });

      prevBtn.addEventListener("click", () => {
        if (!playlist.length) return;
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        loadTrack(prevIndex, true);
      });

      nextBtn.addEventListener("click", () => {
        if (!playlist.length) return;
        const nextIndex = (currentIndex + 1) % playlist.length;
        loadTrack(nextIndex, true);
      });

      audio.addEventListener("ended", () => {
        const nextIndex = (currentIndex + 1) % playlist.length;
        loadTrack(nextIndex, true);
      });

      audio.addEventListener("pause", () => {
        isPlaying = false;
        playBtn.innerHTML = "&#9654;";
      });

      audio.addEventListener("play", () => {
        isPlaying = true;
        playBtn.innerHTML = "&#10074;&#10074;";
      });
    </script>
  </body>
</html>`;
}
