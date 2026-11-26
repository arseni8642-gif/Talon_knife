# Нож Talon — 3D Explorer

Статический одностраничный сайт. Сборка не нужна: корнем сайта является эта папка.

## Файлы

- `index.html` — разметка страницы
- `style.css` — стили
- `script.js` — Three.js-просмотрщик и интерактив
- `assets/` — видео, 3D-модель, фото, иконки
- `netlify.toml` — настройки для Netlify
- `vercel.json` — настройки для Vercel

## Публикация на Netlify

Самый быстрый способ:

1. Откройте https://app.netlify.com/drop
2. Перетащите папку проекта целиком.
3. Получите публичный адрес вида `https://<имя>.netlify.app`.

Через CLI:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Команду нужно выполнить внутри папки проекта. Параметры публикации уже заданы в `netlify.toml`.

## Публикация на Vercel

Через CLI:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Или через сайт:

1. Зайдите на https://vercel.com/new
2. Импортируйте репозиторий с проектом.
3. Framework Preset: **Other**.
4. Root Directory: корень проекта.
5. Build Command и Output Directory оставьте пустыми.
6. Нажмите Deploy.

Настройки кэширования и заголовков уже лежат в `vercel.json`.

## Важно

- Все локальные пути относительные, сайт можно открывать с любого домена.
- Three.js и Google Fonts загружаются с CDN — для них нужен доступ в интернет.
- После изменения файлов нужно заново задеплоить сайт.
- Видео `assets/animation.mp4` и модель `assets/talon.glb` доступны для скачивания прямо со страницы.
