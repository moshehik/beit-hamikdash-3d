# בית המקדש השני – מודל תלת־ממדי (Beit HaMikdash 3D)

מודל תלת־ממדי אינטראקטיבי של בית המקדש השני לפי מסכת מידות, עם סיורי "סדרי העבודה" (תמיד של שחר, קטורת, הטבת נרות, עולות ומנחות) – הקראה בקול (Gemini TTS), מוזיקת רקע, מצלמה עוקבת אחרי הכהן, ודף כניסה.

## בנייה
```
node build.js                 # בונה ../beit-hamikdash-3d.html (+ עותק ל-Downloads של משה)
OUT=/path/t.html node build.js  # בנייה לקובץ אחר בלבד
```
הפלט הוא קובץ HTML יחיד (כ-6MB) שנפתח ישירות בדפדפן.

## מבנה
- `src/` – קוד המקור (app.js, people.js, services.js, ui.js, audio.js, template.html, svc/*.js = תסריטי הסיורים, story*.js = סיפורי ילדים)
- `audio/` + `src/narr.js` – הקראות (mp3 → data URI). הפקה: `node tools/narration.cjs` (נדרשים מפתחות GEMINI_API_KEYS; ר' HANDOFF)
- `assets/` – תמונות ספרייט ניסיוניות
- `lib/` – three.js, OrbitControls, נתוני גיאוגרפיה
- `HANDOFF_*.md`, `AGENT_BRIEF.md` – תיעוד ומצב עבודה

## אתר חי בוורסל (19.11.2026)
כתובת: https://beit-hamikdash-model.vercel.app — פרויקט `beit-hamikdash-model` (צוות moshehiks-projects), מוגש מנאון (טבלה `temple_site_files` בנאון של print-center), בלי פריסה לכל עדכון.
- **עדכון האתר:** `cd site && node publish.mjs` (בונה, מוציא את ההקראות לקבצי mp3, דוחס, מעלה לנאון; מופיע חי תוך כדקה). `--no-build` מעלה את הקובץ האחרון שנבנה.
- `site/.env` = `DATABASE_URL` של הבעלים (להעלאה, לא ב-git). `site/.env.ro` = משתמש `temple_site_ro` לקריאה בלבד שמוגדר בוורסל (גם לא ב-git).
- פריסה נוספת בוורסל נחוצה רק אם משנים את `site/api/serve.js` או `vercel.json`: מ-PowerShell עם `NODE_OPTIONS=--require C:/Users/moshe/hostshim.js` ואז `npx vercel deploy --prod --yes --archive=tgz --token <.vercel-token-new> --scope moshehiks-projects` מתיקיית `site`.
- הצ'אט עם הדמויות פונה ל-print-center; המקור הזה מאושר ב-`EXTRA_ALLOWED_ORIGINS` ב-`lib/templeChat.js` שם.
