# Cloudflare Worker 音乐播放器

使用 Cloudflare Workers 构建的简洁音乐播放器。页面左侧展示当前正在播放的歌曲封面和控制按钮，右侧为播放列表。数据默认存储在 Cloudflare KV 中，可通过 API 更新。

## 功能特性

- 🎵 响应式音乐播放器布局：左侧封面 + 控制按钮，右侧播放列表。
- ☁️ 基于 Cloudflare Workers 部署，无需单独的服务器。
- 💾 使用 Cloudflare KV 保存播放列表数据，支持通过 API 更新。

## 本地开发

1. 安装依赖：

   ```bash
   npm install
   ```

2. 启动本地开发服务（需要登录 Wrangler）：

   ```bash
   npm run dev
   ```

   打开终端中提示的本地地址即可预览音乐播放器页面。

## KV 命名空间

在部署前，需要创建并绑定一个 Cloudflare KV 命名空间：

```bash
wrangler kv:namespace create PLAYLIST
wrangler kv:namespace create PLAYLIST --preview
```

将命令输出的 `id` 和 `preview_id` 填入 `wrangler.toml` 中对应的位置。

## API

- `GET /api/playlist` 获取播放列表（默认为 Worker 中的内置示例数据）。
- `PUT /api/playlist` 覆盖播放列表，需要在请求体中传入 JSON 数组，并确保已绑定 KV。

## 生产部署

```bash
npm run deploy
```

首次部署会提示登录 Cloudflare 账号，之后 Worker 即可上线。
