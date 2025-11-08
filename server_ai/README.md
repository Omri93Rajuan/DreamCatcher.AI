# DreamCatcher.AI – Server (API & AI)

שרת ה-Backend של DreamCatcher.AI כתוב ב-TypeScript ומבוסס על **Express + Mongoose**. הוא מטפל באימות משתמשים, ניהול חלומות, מאמרים ציבוריים, טפסי צור קשר וחיבור גמיש למודלים מבוססי LLM (OpenRouter או MCP).

## מודולים מרכזיים

- ⚙️ **Auth & Users** – JWT, אימות רב-שלבי, שחזור סיסמה, תבניות מייל.
- 💤 **Dreams Service** – שמירה/עריכה/מחיקה, פילטרים, סטטיסטיקות Aggregation.
- 🧠 **LLM** – מעטפת `src/llm` עם ספק OpenRouter
- 📨 **Mailer & Templates** – שליחת הודעות אימות, reset, הזמנות.
- 🧾 **Validation** – סכמות Zod + middleware לטיפול בשגיאות סטנדרטיים.

## דרישות

- Node.js ≥ 20
- MongoDB (ענן או מקומי)

## התקנה והרצה

```bash
cd server_ai
npm install
npm run dev      # nodemon + tsc-watch
# או:
npm run build && npm start
```

### סקריפטים זמינים

| פקודה           | תיאור                            |
| --------------- | -------------------------------- |
| `npm run dev`   | בנייה במעקב + nodemon.           |
| `npm run build` | קומפילציה ל-`dist/`.             |
| `npm start`     | הפעלת קבצי `dist`.               |
| `npm test`      | Jest (כולל Mongo Memory Server). |

## קובצי סביבה (`server_ai/.env`)

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/dreamcatcher
JWT_SECRET=your_secret
APP_URL=http://localhost:5173

# ספק LLM ברירת מחדל (OpenRouter)
OPENROUTER_API_KEY=sk-...
OPENROUTER_MODEL=meta-llama/....

## מבנה ספרייה
```

src/
controllers/ # auth.controller.ts, dream.controller.ts ...
services/ # dream.service.ts, users.service.ts ...
llm/ # index.ts, openrouter.provider.ts, llm.types.ts
mcp/ # MCP client, provider, types
models/ # סכמות Mongoose
routes/ # מיפוי REST
helpers/ # mailer, bcrypt, error mapping
validation/ # Zod schemas
types/ # הגדרות משותפות (DreamCategory וכו')

```

## שימוש ב-LLM
1. ברירת מחדל: OpenRouter – דרוש `OPENROUTER_API_KEY`.
2. ניתן להזריק ספק מותאם אישית באמצעות `setLLMProvider` בבדיקות.

## בדיקות
- `npm test` מפעיל Jest עם Mongo Memory Server.
- לצורך בדיקות אינטגרציה מול MCP, מומלץ ליצור Mock Server ולהגדיר `MCP_SERVER_URL` ייעודי.

## נקודות הרחבה
- **Contact API** – חיבור ל-SMTP או שירות הודעות.
- **Rate Limiting** – שילוב Redis/Upstash לנתוני LLM.
- **Webhooks** – התחברות לספקים חיצוניים עבור ניתוחים נוספים.

---
השרת מספק את הקרקע לשירות חלומות חכם, מאובטח ומתרחב. 🎛️🧠
```
