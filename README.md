# Smriti Care — Phase 1 (SIH 26003)

Foundation + Visual System + Responsive Tablet UX.

## Stack
React + TypeScript + Vite + Tailwind CSS + Framer Motion + React Router + Lucide.

## Routes
- `/` → `/welcome`
- `/welcome`
- `/auth/patient` (Face Verification layout foundation; real camera in Phase 2)
- `/auth/caregiver`
- `/patient` (Patient Home)
- `/caregiver` (Caregiver Dashboard)

## Run
```bash
npm install
npm run dev
```

## Validate
```bash
npx tsc --noEmit
npm run build
```

## Notes
- Phase 1 uses local demo data in `src/data/demoData.ts`.
- Strings use translation keys (`src/i18n/en.ts`, `src/i18n/as.ts`) for English + Assamese.
- Supabase is intentionally NOT wired; see `.env.example` + `src/app/config.ts` service boundary.
- No real face detection / games / analytics in Phase 1 — only clean foundations.
