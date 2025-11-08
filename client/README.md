# DreamCatcher.AI – Client

אפליקציית ה-Frontend של DreamCatcher.AI נבנתה עם **React 18 + Vite** ומציעה חוויית RTL מלאה, ספריית מאמרים מתקדמת, טפסי אימות עשירים וטפסי צור קשר. המסמוך הנוכחי מספק תיאור קצר של התצורה, תהליכי פיתוח וסטנדרטים עיצוביים.

## תכונות עיקריות
- 🧭 Layout מותאם RTL עם ניווט Desktop/Mobile, Theme toggle ופוטר מותאם.
- 📚 מודול מאמרים עם כרטיסי Spotlight, Pagination, תגיות אחידות ותמונות מאונדקסות.
- 🔐 זרימת Auth מודרנית: Signup/Login ב-Hebrew UX, אימות שדות, טופס “שכחתי סיסמה”.
- 📨 דף צור קשר עם אימותים, הודעות מצב והכנה לשליחה לשרת.
- 🌗 Theme Management + תמיכה מלאה ב-Responsive breakpoints.

## טכנולוגיות
| קטגוריה | כלים |
| --- | --- |
| Framework | React 18, TypeScript |
| Build | Vite |
| Styling | TailwindCSS, Framer Motion, Radix UI Icons |
| State/Data | Zustand, TanStack Query, i18next |
| Utilities | clsx, zod, dayjs |

## התחלה מהירה
```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

### סקריפטים שימושיים
| פקודה | הסבר |
| --- | --- |
| `npm run dev` | Vite dev server עם HMR. |
| `npm run build` | בניית Production לטובת דפלוימנט. |
| `npm run preview` | הרצת build מקומי לבדיקה לפני העלאה. |
| `npm run lint` | בדיקת ESLint + TypeScript. |

## קובצי סביבה
צור קובץ `client/.env` (או `.env.local`) עם הערכים:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=DreamCatcher.AI
```
ניתן להוסיף ערכים נוספים (כגון `VITE_SENTRY_DSN`) לפי הצורך. הקפד לא להתחייב סודות למאגר.

## מבנה ספרייה מרכזי
```
src/
  components/
    articles/        # ArticleCard, Spotlight, ArticleView, coverImages etc.
    auth/            # SignupForm, LoginForm, related hooks
    dreams/          # Category pills, stats widgets
  pages/             # HomePage, ArticlesPage, Login/Register וכו'
  layout/            # layout.tsx (Header, Footer, Drawer)
  lib/
    api/             # קריאות REST + category metadata
    hooks/           # TanStack Query hooks
  i18n/              # הגדרות תרגום (he-IL כברירת מחדל)
  assets/            # לוגואים ותמונות סטטיות
```

## קווים מנחים לעיצוב
1. **Minimalistic Premium** – ללא אפקטים מוגזמים, שימוש ב-gradients רכים וצל קל.
2. **Hover חלק** – אין שינויי border-radius על hover (נבחר transition אחיד בין scale/opacity).
3. **Spacing קבוע** – שימוש ב-gap ו-padding אחידים לטובת קונסיסטנטיות רספונסיבית.
4. **טיפוגרפיה** – כותרות במשקל 600–700, טקסט גוף ב-`text-slate-600` או `dark:text-white/70`.

## בדיקות והקשחה
- הפעל `npm run lint` לפני כל PR.
- מומלץ להריץ `npm run build && npm run preview` כדי לוודא שאין בעיות RTL ב-SSR.
- בדיקות UI בצד שלישי (Playwright/Cypress) בתהליך תכנון – מכינים Storybook ייעודי.

## טיפים לפיתוח
- עבדו ב-`dir="rtl"` היכן שצריך, אך השאירו מרכיבים גלובליים דו-כיווניים (למשל הכפתורים בטפסים).
- שמרו על פריסה אחידה של תגיות במאמרים באמצעות utility ב-`coverImages.ts`.
- אם מוסיפים תכונת ניווט חדשה – עדכנו גם את ה-drawer במובייל כדי לשמור סנכרון.

בהצלחה! 💫
