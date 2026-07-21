# Briefly backend

### Sharing the full browser application

This repository contains only the API. The frontend must be running and shared separately. Start it in its own project folder, then create a second tunnel for the frontend port (Vite commonly uses `5173`):

```powershell
npx ngrok http 5173
```

Configure the frontend's public API base URL with the backend tunnel URL. For a Vite frontend, put this in its `.env.local` file and restart the frontend dev server:

```env
VITE_API_BASE_URL="https://your-backend.ngrok-free.app/api"
```

Use `import.meta.env.VITE_API_BASE_URL` in the frontend API client instead of a hard-coded `http://localhost:4000/api`. Send your manager the **frontend** ngrok URL, not the backend URL.

Before starting the backend, either set `CORS_ORIGIN` in `.env` to the exact public frontend URL, such as:

```env
CORS_ORIGIN="https://your-frontend.ngrok-free.app"
```

Restart `npm run dev` after changing `.env`. This permits browser requests from the shared frontend while keeping other origins blocked.

Alternatively, for temporary ngrok demos only, use this setting to allow any HTTPS `*.ngrok-free.app` frontend URL:

```env
ALLOW_NGROK_ORIGINS=true
```

Keep this `false` outside a temporary demo and restart the backend after changing it.

Do not share the API URL widely: it uses your configured database, email provider, and AI credentials.
