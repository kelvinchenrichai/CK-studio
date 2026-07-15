# Render preview deployment

Create a **Web Service** (not a Static Site).

- Runtime: Node
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`

If these project files are at the GitHub repository root, leave Root Directory blank.
If the files are inside a `ck-studio` folder, set Root Directory to `ck-studio`.

Add the public Supabase variables during the build, because Vite embeds `VITE_*` values into the frontend bundle.
Keep `VITE_ENABLE_SUPABASE=false` and `ENABLE_STRIPE_CHECKOUT=false` for the public preview. The current database migration and administrator login are not production-safe.
