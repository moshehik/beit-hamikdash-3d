# הפקת הקראה בקול לסיורים (Gemini TTS)

כלי אחד לכל הסיורים: `tools/narration.cjs`. קול ברירת מחדל Achird (אותו קול של כל הסיורים), קצב `atempo 0.93`, MP3 מונו 24kHz / 24kbps עם כניסה ויציאה רכות.

## שני סוגי מקורות

1. **סיורים כתובים ב-`src/svc/*.js`** – הסקריפט קורא את כל `text:'…'` של כל `SERVICES.push({id:'…'`. מפתח הקליפ = `<id>-<אינדקס>`. אם קיים סיפור ילדים ב-`STORY['<id>-<אינדקס>']` – הוא מוקרא במקום.
2. **סיורים שנוצרים בקוד (מחולל)** – כמו יום כיפורים (`tools/gen-yk.cjs`). אין ב-`src/svc` מחרוזות `text:` מילוליות, ולכן הסקריפט לא ראה אותם (זו הסיבה שלא היה קול). המחולל כותב `tools/narr-sources/<id>.json`:

```json
{ "id": "yom-kippur", "ext": true, "steps": [ { "idx": 0, "text": "…" }, { "idx": 1, "text": "…" } ] }
```

`idx` חייב להיות אינדקס השלב ב-`SERVICES[…].steps` (כי הנגן מחפש `NARR[<id>-<idx>]`). סיור שיש לו מקור כזה מדולג בסריקת `src/svc`.

## `ext:true` – קליפים חיצוניים

* בלי `ext` – הקליפ נשמר ב-`audio/<key>.mp3` ונארז כ-data-URI לתוך `src/narr.js` (כמו הסיורים הקודמים; `publish.mjs` מוציא אותם לקבצי `a/<hash>.mp3`).
* עם `ext:true` – הקליפ נשמר כ-`audio/ext/<key>-<hash-של-הטקסט>.mp3`, ו-`src/narr.js` מכיל רק `NARR['<key>']=['a/<שם>.mp3', שניות]`. החבילה הראשית לא גדלה; הקובץ נטען רק כשהשלב מתחיל, ו-`AUD.prefetch` מביא מראש את שני השלבים הבאים. השם כולל hash, לכן עדכון טקסט = שם חדש = אין בעיית מטמון (`immutable`).
* `node site/publish.mjs` מעלה מ-`audio/ext/` רק את הקבצים שמופיעים בקוד כ-`"a/<שם>"`.
* בבנייה מקומית (`build.js` / קובץ יחיד שנפתח מהדיסק) הקבצים החיצוניים לא כלולים: הנגן מזהה כשל טעינה ועובר לתזמון לפי אורך הטקסט (בלי קול, הסיור ממשיך כרגיל). ב-GitHub Pages יש להעתיק את `audio/ext/*.mp3` אל `docs/a/`.

## פקודות

```powershell
node tools/gen-yk.cjs                 # מחולל יום כיפורים (כולל narr-sources/yom-kippur.json)
node tools/narration.cjs list         # מציג את הטקסטים (מנוקדים) – גם מנקד ושומר במטמון
node tools/narration.cjs              # מפיק קליפים חסרים/ישנים; ממשיך מאיפה שעצר (manifest.json)
ONLY=yom-kippur-5,yom-kippur-6 node tools/narration.cjs
SKIP=olat-haof node tools/narration.cjs
LIMIT=20 node tools/narration.cjs     # מקס' קליפים בהרצה
node tools/narration.cjs pack         # רק אורז את narr.js מהקיים
```

סיור חדש עם מחולל: אחרי יצירת ה-JSON של הסיור, כתבו `tools/narr-sources/<id>.json` באותו פורמט (`ext:true`) והריצו `node tools/narration.cjs`.

## מכסה ובקרת איכות

* מפתחות מ-`print-center/.env` (`GEMINI_API_KEYS`), השיחה דרך `curl` (הסינון שובר fetch של Node). מפתח שקיבל 429 מושהה 6 שעות והסקריפט עובר הלאה; הרצה חוזרת ממשיכה.
* ניקוד אוטומטי: `tools/niqqud.cjs` + מטמון `audio/niqqud-cache.json` + תיקונים ב-`tools/niqqud-fixes.json`. ה-hash של הקליפ כולל את הטקסט המנוקד.
* אותיות עבריות בודדות (ו = וַב וכו') – ראו הערת הזיכרון `hebrew-letter-names-tts-stt`; בסיורים אין אותיות בודדות.

## נגן

`SV` (src/services.js) קורא ל-`AUD.narr(key, speed, onEnd)` בתחילת כל שלב; השלב לא מסתיים לפני שהקליפ נגמר. אם הקובץ לא נטען / נחסם / הדפדפן מסרב להפעלה אוטומטית, `onEnd(true)` מחזיר את התזמון לפי אורך הטקסט. כפתור 🔊 מכבה קול (והסיור ממשיך לפי הטקסט); מהירות מעל 2× מדלגת על הקול.
