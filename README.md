# DreamCatcher.AI

**DreamCatcher.AI** היא פלטפורמת פרשנות חלומות בעברית המשלבת בין עולמות הפסיכולוגיה, הקבלה וה-AI. המשתמשים יכולים לכתוב חלום, לקבל פרשנות עשירה, לשמור יומן חלומות, לקרוא מאמרים ולפנות דרך טופס “צור קשר” – הכל בחוויה RTL מלאה.

## מה מייחד את המערכת?
- 🎯 התאמה ישראלית מלאה – RTL, תוכן בעברית, תגיות וקטגוריות רלוונטיות.
- 🧠 AI פרסונלי – צריכת LLM (OpenRouter או MCP) לניתוח חלומות וקטלוגם.
- 📚 ספריית מאמרים – עיצוב רספונסיבי, תגיות אחידות, קארד Spotlight + Pagination.
- 💤 יומן וחוויית משתמש – שמירת חלומות, שיתוף ציבורי ומדדים דינמיים.
- 📬 היבט שירות – טופס צור קשר, אימותים בצד לקוח והכנה לשליחת מיילים.

## ארכיטקטורה ברמה גבוהה
```
client/            אפליקציית React + Vite + Tailwind (i18n, Zustand, TanStack Query)
server_ai/         שרת Express + Mongoose + שכבת LLM/MCP
nginx/             קבצי תצורת Nginx לפריסה
```

## סטאק טכנולוגי מרכזי
- **Front-End**: React 18, Vite, TypeScript, TailwindCSS, Framer Motion, i18next.
- **Back-End**: Node.js 20, Express, Mongoose, Zod, Socket.IO.
- **AI**: חיבור גמיש ל-OpenRouter ולספק MCP (WebSocket).
- **Dev & DX**: ESLint, Prettier, Jest, ts-jest, npm scripts סדורים.

## התחלה מהירה
```bash
git clone <repo>
cd DreamCatcher.AI

# התקנת תלות לפי חבילה
cd client && npm install
cd ../server_ai && npm install
```
1. הגדרו קובצי `.env` (פירוט בכל README ייעודי).
2. הריצו את שני השרתים במקביל:
   - `npm run dev` מתוך `client/`
   - `npm run dev` או `npm start` מתוך `server_ai/`
3. גלשו אל `http://localhost:5173`.

## מבנה תיקיות עיקרי
| נתיב | תיאור |
| --- | --- |
| `client/` | קוד ה-UI, רכיבי מאמרים, דפי הזדהות, i18n ועוד. |
| `server_ai/` | API, אימות JWT, חיבורי LLM/MCP, בקרי חלומות ומיילים. |
| `nginx/` | קובצי קונפיגורציה לדפלוימנט. |
| `assets/` | לוגואים ותמונות משותפות (לדוגמה כותבים). |

## בדיקות ואיכות
- `npm run lint` / `npm run test` בכל חבילה.
- כיסוי Jest עבור לוגיקה עסקית בשרת.
- בדיקות ויזואליות ו-E2E (Playwright/Cypress) בתכנון.

## README ייעודיים
- [`client/README.md`](client/README.md) – הרצת ה-Frontend, סקריפטים ו-UX.
- [`server_ai/README.md`](server_ai/README.md) – תיעוד API, חיבורי MCP/LLM והגדרות סביבתיות.

---
**DreamCatcher.AI** – להפוך חלומות לתובנות מציאותיות. 👁️✨
