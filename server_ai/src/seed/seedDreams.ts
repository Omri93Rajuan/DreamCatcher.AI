import { faker } from "@faker-js/faker";
import { Dream } from "../models/dream";
import User from "../models/user";
import { DREAM_CATEGORIES } from "../types/categories.interface";
type DreamCategory = (typeof DREAM_CATEGORIES)[number];
const ALLOWED = new Set<string>(DREAM_CATEGORIES);
const clamp01 = (n: number) => Math.max(0, Math.min(1, Number(n) || 0));
const uniq = <T>(arr: T[]) => Array.from(new Set(arr));
const KEYWORDS: Record<DreamCategory, RegExp[]> = {
    flying: [/עף(?:ה)?|תעופ[הת]/i],
    falling: [/נפל[תי]|נפילה|נופל/i],
    being_chased: [/רדפו?|מרדף|מַרְדָּף|רודפ/i],
    teeth: [/שן|שיניים/i],
    exam: [/מבחן|בחינה/i],
    late: [/איחור|איחרת/i],
    death: [/מוות|מתתי|נפטר/i],
    romance: [/אהבה|רומנטיק|בן זוג|בת זוג/i],
    work: [/עבודה|משרד|בוס/i],
    school: [/בית ספר|כיתה|מורה|סטודנט/i],
    family: [/משפחה|אמא|אב[א]|אחות|אח|ילד/i],
    animals: [/כלב|חתול|חיה|אריה|נחש/i],
    water: [/ים|מים|נחל|נהר|בריכה/i],
    house: [/בית|דירה|חדר|סלון|מטבח/i],
    vehicle: [/רכב|מכונית|אוטו|אופנוע|אוטובוס/i],
    travel: [/נסיעה|טיול|טסתי|שדה תעופה/i],
    lost: [/איבד[תי]|ללכת לאיבוד|לא מצאתי/i],
    monster: [/מפלצת|יצור|איום|שד/i],
    paralysis: [/שיתוק(?: שינה)?/i],
    lucid: [/צלול|מודע שאני חולם/i],
};
function categorize(text: string): {
    categories: DreamCategory[];
    scores: Record<DreamCategory, number>;
} {
    const scores: Record<DreamCategory, number> = {} as any;
    for (const cat of DREAM_CATEGORIES) {
        const regs = KEYWORDS[cat] || [];
        let score = 0;
        for (const rgx of regs) {
            const matches = text.match(new RegExp(rgx.source, rgx.flags + "g"));
            if (matches?.length)
                score += Math.min(0.4 + matches.length * 0.15, 1);
        }
        if (score > 0)
            scores[cat] = clamp01(score);
    }
    const top = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k]) => k as DreamCategory);
    return { categories: top, scores };
}
async function seedDreams(count: number = 10, force: boolean = false) {
    const existing = await Dream.find();
    if (existing.length > 0 && !force) {
        console.log("Dreams already exist, skipping...");
        return existing;
    }
    const users = await User.find();
    if (users.length === 0) {
        console.warn("⚠️ No users found! Please seed users first.");
        return [];
    }
    const dreamTemplates = [
        {
            title: "חלום על מים שזורמים בין הידיים",
            text: "ראיתי את עצמי עומד ליד נחל, מנסה לתפוס את המים אבל הם כל הזמן חומקים מבין האצבעות שלי. הרגשתי גם שלווה וגם תסכול.",
            interpretation: "המים מסמלים רגשות וזרימה פנימית... המסר הוא ללמוד לסמוך על הזרימה מבלי להילחם בה.",
        },
        {
            title: "נפילה ממגדל גבוה",
            text: "עמדתי בראש מגדל גבוה, הבטתי למטה ופתאום הקרקע נעלמה מתחתיי. נפלתי בתחושת פחד עצום עד שהתעוררתי מזיע.",
            interpretation: "נפילה מסמלת לעיתים אובדן ביטחון או פחד מכישלון... דווקא דרך הוויתור תמצא קרקע יציבה חדשה.",
        },
        {
            title: "חלום על תעופה חופשית בשמיים",
            text: "חלמתי שאני עף גבוה מעל הערים, מסתכל על העולם מלמעלה, מרגיש חופש מוחלט.",
            interpretation: "עוף בחלום מסמל חופש, העצמה ושחרור ממגבלות... התפתחות וצמיחה פנימית.",
        },
        {
            title: "שן נופלת באמצע שיחה",
            text: "דיברתי עם מישהו ופתאום הרגשתי שן מתנדנדת ונופלת לי מהפה. ניסיתי להחזיר אותה למקום ולא הצלחתי.",
            interpretation: "שיניים נופלות בחלום קשורות לרוב לתחושת חוסר ביטחון או פחד מאיבוד כוח אישי...",
        },
        {
            title: "מרדף מסתורי ברחובות חשוכים",
            text: "מישהו רדף אחריי ברחובות לילה ריקים. לא הצלחתי לראות את פניו, רק שמעתי את הצעדים מאחוריי.",
            interpretation: "המרדף מסמל פחדים לא מודעים או נושאים שאתה נמנע מלהתמודד איתם...",
        },
        {
            title: "חלום על ים סוער",
            text: "מצאתי את עצמי בלב ים, הגלים היו עצומים והרוח חזקה. הרגשתי שאני נמשך מטה אבל גם נלחם כדי לצוף.",
            interpretation: "ים סוער בחלום הוא סמל קלאסי לעולם רגשי סוער... מראה על כוחות הישרדות ויכולת להתמודד עם קשיים.",
        },
    ];
    const docs = Array.from({ length: count }, () => {
        const randomUser = faker.helpers.arrayElement(users);
        const template = faker.helpers.arrayElement(dreamTemplates);
        const variance = faker.lorem.sentence({ min: 6, max: 16 });
        const userInput = `${template.text} ${variance}`;
        const { categories, scores } = categorize(`${template.title} ${userInput}`);
        const isShared = faker.datatype.boolean();
        const createdAt = faker.date.recent({ days: 90 });
        const sharedAt = isShared
            ? faker.date.between({ from: createdAt, to: new Date() })
            : null;
        return {
            userId: randomUser._id,
            title: template.title,
            userInput,
            aiResponse: template.interpretation,
            isShared,
            sharedAt,
            categories,
            categoryScores: scores,
            createdAt,
            updatedAt: new Date(),
        };
    });
    if (force && existing.length > 0) {
        await Dream.deleteMany({});
    }
    const created = await Dream.insertMany(docs);
    console.log(`✅ Inserted ${created.length} enriched Hebrew dreams (with categories)`);
    return created;
}
export default seedDreams;
