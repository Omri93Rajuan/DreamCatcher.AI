import { faker } from "@faker-js/faker";
import { Types } from "mongoose";
import { Dream } from "../models/dream";
import User from "../models/user";

async function seedDreams(count: number = 10) {
  const existing = await Dream.find();
  if (existing.length > 0) {
    console.log("Dreams already exist, skipping...");
    return existing;
  }

  const users = await User.find();

  if (users.length === 0) {
    console.warn("⚠️ No users found! Please seed users first.");
    return [];
  }

  const dreams = Array.from({ length: count }, () => {
    const randomUser = faker.helpers.arrayElement(users);
    const dreamText = faker.lorem.sentences({
      min: 2,
      max: 4,
    });

    const title = faker.helpers.arrayElement([
      "חלום על מים זורמים",
      "נפילה ממגדל גבוה",
      "תעופה בשמיים",
      "שן נופלת",
      "מרדף מסתורי",
      "דלתות שלא נפתחות",
      "ילדות רחוקה",
      "אור מסנוור",
      "פגישה עם אדם לא מוכר",
      "ים סוער",
    ]);

    const aiResponse = faker.helpers.arrayElement([
      "החלום מסמל שינוי רגשי והתחדשות.",
      "ייתכן שאתה חווה חוסר שליטה במציאות חייך.",
      "זהו סימן לרצון לברוח מהשגרה ולהתעלות.",
      "מייצג תחושת פחד או אובדן כוח.",
      "רמז להזדמנות חדשה שממתינה לך בקרוב.",
      "החלום הזה קשור לאי-ודאות ולצורך בביטחון.",
      "מראה על געגוע לעבר ולביטחון ישן.",
      "מסמל הארה רוחנית או תובנה חדשה.",
      "ייתכן שאתה מנסה להתמודד עם חלקים לא מוכרים בעצמך.",
      "סימן לרגשות עזים שדורשים שחרור.",
    ]);

    return {
      userId: randomUser._id,
      title,
      userInput: dreamText,
      aiResponse,
      createdAt: faker.date.recent({ days: 60 }),
      updatedAt: new Date(),
    };
  });

  const created = await Dream.insertMany(dreams);
  console.log(`Inserted ${created.length} fake dreams`);
  return created;
}

export default seedDreams;
