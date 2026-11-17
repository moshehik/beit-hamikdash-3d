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
