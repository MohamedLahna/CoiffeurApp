# Atelier Noir

Premium barber booking platform — Laravel 11 API + React 18/Vite frontend.

## Quick start

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
```

The React experience is available at `http://localhost:5173`. Configure MySQL in `.env`. The API exposes `/api/services`, `/api/barbers`, `/api/availability`, and authenticated appointment endpoints.

The availability engine checks working hours, breaks, 15-minute increments, and pending/confirmed overlaps before returning start times.

## Admin sign-in and live translations

Admin access is restricted to the verified Google account `mohamedlahna2006@gmail.com`. Create a Google OAuth **Web application** client in Google Cloud Console, add `http://localhost:5173` as an authorized JavaScript origin, then put that client ID in both `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` in `.env`. The backend validates Google's signed ID token before issuing an admin-only Sanctum token; all `/api/admin/*` routes require it. After changing environment values, run `php artisan config:clear` and restart Vite.

Live UI translations are requested through Laravel's `/api/translations` endpoint and translated online by MyMemory (`https://api.mymemory.translated.net/get`). Results are cached for 14 days, so phrases already translated do not consume quota again. The anonymous free allowance is limited; an optional `TRANSLATION_CONTACT_EMAIL` can be sent to MyMemory as its contact parameter for its higher daily allowance. Only set that value if you consent to sharing it with the translation provider. The French locale JSON remains an offline fallback. Set `MYMEMORY_TRANSLATION_URL` to override the endpoint.
