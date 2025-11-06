import * as React from "react";
import { createPortal } from "react-dom";
type Props = {
    open: boolean;
    onClose: () => void;
    onAccept: () => void;
};
export default function TermsDialog({ open, onClose, onAccept }: Props) {
    const scrollRef = React.useRef<HTMLDivElement | null>(null);
    const [scrolledToEnd, setScrolledToEnd] = React.useState(false);
    React.useEffect(() => {
        if (!open)
            return;
        const el = scrollRef.current;
        if (!el)
            return;
        const onScroll = () => {
            const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
            if (atEnd)
                setScrolledToEnd(true);
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => el.removeEventListener("scroll", onScroll);
    }, [open]);
    if (!open)
        return null;
    return createPortal(<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl rounded-2xl overflow-hidden glass-card border border-white/20 bg-white/15 shadow-2xl text-white">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/15">
          <h4 className="font-bold">תנאי שימוש והבהרת אחריות</h4>
          <button onClick={onClose} className="text-white/80 hover:text-white transition" aria-label="סגור">
            ✕
          </button>
        </div>

        <div ref={scrollRef} className="max-h-[60vh] overflow-auto px-5 py-4 space-y-4 text-sm leading-6 text-white/90">
          <p>
            ברוך/ה הבא/ה! השימוש בשירות כפוף לתנאי שימוש אלה. אנא קרא/י אותם
            בעיון. המשך שימוש מהווה הסכמה מלאה.
          </p>

          <h5 className="font-semibold mt-2 text-white">1. מטרת השירות</h5>
          <p>
            השירות מספק כלים, תכנים ותובנות הקשורים לפענוח חלומות לצורכי{" "}
            <strong className="text-white">בידור, השראה וסקרנות בלבד</strong>.
            אין לראות במידע באתר או במערכת ייעוץ מקצועי מכל סוג, לרבות
            פסיכולוגי, רפואי, טיפולי, משפטי או רוחני.
          </p>

          <h5 className="font-semibold mt-2 text-white">2. הסרת אחריות</h5>
          <p>
            מובהר כי המפעילים, עובדיהם, שותפיהם וספקיהם{" "}
            <strong className="text-white">אינם אחראים</strong> לכל החלטה, פעולה
            או תוצאה הנובעת מהסתמכות המשתמש/ת על מידע, פירושים או תכנים המופיעים
            בשירות. כל שימוש בתוכן הינו באחריות המשתמש/ת בלבד.
          </p>

          <h5 className="font-semibold mt-2 text-white">3. פרטיות ואבטחה</h5>
          <p>
            ייתכן וייאסף מידע אישי בהתאם למדיניות הפרטיות. אנו נוקטים באמצעי
            אבטחה סבירים, אך לא ניתן להבטיח אבטחה מוחלטת.
          </p>

          <h5 className="font-semibold mt-2 text-white">4. התנהלות משתמש/ת</h5>
          <p>
            חל איסור להעלות תכנים פוגעניים, מפרי זכויות, בלתי חוקיים או כאלה
            העלולים לפגוע באחרים.
          </p>

          <h5 className="font-semibold mt-2 text-white">5. קניין רוחני</h5>
          <p>
            זכויות הקניין הרוחני בשירות ובתכנים המקוריים שבו שמורות למפעיל. אין
            להעתיק, להפיץ, לשנות או לעשות שימוש מסחרי ללא רשות.
          </p>

          <h5 className="font-semibold mt-2 text-white">
            6. שינויים והפסקת שירות
          </h5>
          <p>
            אנו רשאים לעדכן תנאים אלו, לשנות או להפסיק את השירות, כולו או חלקו,
            לפי שיקול דעתנו, ללא הודעה מוקדמת.
          </p>

          <h5 className="font-semibold mt-2 text-white">7. דין ושיפוט</h5>
          <p>
            על תנאים אלו יחולו דיני מדינת ישראל וסמכות השיפוט הבלעדית נתונה לבתי
            המשפט המוסמכים.
          </p>

          <p className="italic text-white/80">
            באמצעות לחיצה על “אני מאשר/ת את תנאי השימוש” את/ה מאשר/ת שקראת והבנת
            את תנאי השימוש ואת הבהרת האחריות.
          </p>
          <div className="h-2"/>
        </div>

        <div className="px-5 py-3 border-t border-white/15 bg-white/5">
          {!scrolledToEnd ? (<div className="text-xs text-white/70 mb-2">
              יש לגלול את המסמך עד סופו כדי לאפשר אישור.
            </div>) : (<div className="text-xs text-emerald-300/90 mb-2">אפשר לאשר.</div>)}
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/15 transition">
              ביטול
            </button>
            <button onClick={() => {
            if (!scrolledToEnd)
                return;
            onAccept();
            onClose();
        }} disabled={!scrolledToEnd} className="px-4 py-2 rounded-xl font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 transition">
              אני מאשר/ת את תנאי השימוש
            </button>
          </div>
        </div>
      </div>
    </div>, document.body);
}
