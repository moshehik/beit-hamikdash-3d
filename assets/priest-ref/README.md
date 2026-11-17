# priest-ref – תמונות עזר לדגם הכהן (17.11.2026)

הופקו במנוע Gemini (Oracle gemini-engine, `POST /generate`, פורמט png, חשבון default) – 3 קריאות בסך הכול.
כללי צניעות נאכפים בשרת (נוספים אוטומטית). פרומפטים: `prompt-*.txt`.

- `sheet1.jpg` – גיליון דמות: כהן הדיוט בבגדי בוץ, חזית / צד / גב (לפיו נקבעו פרופורציות, אורך כתונת, מכנסיים, זקן ופיאות).
- `belt.jpg` – אבנט רקום שטוח (יהלומים בתכלת/ארגמן/שני/לבן). חתך ממנו -> `belt-tex.png` (נארז כ-data URI ב-`src/people_tex.js`).
- `turban.jpg` – מגבעת חרוט מלופפת בספירלה + פנים/זקן/פיאות מסולסלות (פרופיל לפיו נבנתה `wcap()` ב-`src/people.js`).
- `linen-tile.png` – טקסטורת קפלי פשתן (מנורמלת, מכפיל) מחיתוך חזה הכתונת בגיליון.
- `model-before.jpg` / `model-after.jpg` – השוואה: חזית, צד, גב. `model-after-head.jpg` – קרוב של הראש. `model-after-kinds-poses.jpg` – כהן גדול (זהב/לבן) וכמה תנוחות.
- `make-textures.py` – מייצר את `src/people_tex.js` מהתמונות (דורש sheet1.png / belt_crop.png במקום ההרצה).
- צבעים דגומים: פשתן #e3dfd6, עור #c08c74, זקן #3a261d, כחול האבנט #2e4765.
- הערה: הפיילוט הישן (`assets/priest.png` וכו', ספרייטים) לא נגע.
