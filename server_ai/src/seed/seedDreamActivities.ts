import { faker } from "@faker-js/faker";
import { DreamActivity } from "../models/dreamActivity";
import { Dream } from "../models/dream";
import User from "../models/user";

/**
 * זורע פעילות בסיסית (צפיות/לייקים/דיסלייקים) לחלומות קיימים.
 * לא מניח שקיימים קאונטרים על Dream – הנתונים נשמרים בטבלת האירועים.
 */
export default async function seedDreamActivities({
  viewsRange = [30, 120],
  likesRange = [0, 30],
  dislikesRange = [0, 6],
  daysBack = 45,
}: {
  viewsRange?: [number, number];
  likesRange?: [number, number];
  dislikesRange?: [number, number];
  daysBack?: number;
} = {}) {
  const dreams = await Dream.find().lean();
  const users = await User.find().lean();

  if (!dreams.length) {
    console.warn("⚠️ No dreams found. Seed dreams first.");
    return;
  }
  if (!users.length) {
    console.warn("⚠️ No users found. Seed users first.");
    return;
  }

  const existing = await DreamActivity.estimatedDocumentCount();
  if (existing > 0) {
    console.log("DreamActivity already has data — skipping.");
    return;
  }

  const activities: Array<{
    dreamId: any;
    userId: any;
    ipHash: string | null;
    type: "view" | "like" | "dislike";
    dayBucket: string;
    createdAt: Date;
  }> = [];

  const randDate = () => faker.date.recent({ days: daysBack });

  for (const dream of dreams) {
    const views = faker.number.int({ min: viewsRange[0], max: viewsRange[1] });
    const likes = faker.number.int({ min: likesRange[0], max: likesRange[1] });
    const dislikes = faker.number.int({
      min: dislikesRange[0],
      max: dislikesRange[1],
    });

    // צפיות (נשתמש במשתמשים אקראיים כדי לדמות ייחודיות יומית)
    for (let i = 0; i < views; i++) {
      const u = faker.helpers.arrayElement(users);
      const d = randDate();
      activities.push({
        dreamId: dream._id,
        userId: u._id, // צפייה מזוהה (אם תרצה גם אנונימיים — תן userId=null ו-ipHash רנדומלי)
        ipHash: null,
        type: "view",
        dayBucket: d.toISOString().slice(0, 10),
        createdAt: d,
      });
    }

    // לייקים
    const likeUsers = faker.helpers.arrayElements(
      users,
      Math.min(likes, users.length)
    );
    for (const u of likeUsers) {
      const d = randDate();
      activities.push({
        dreamId: dream._id,
        userId: u._id,
        ipHash: null,
        type: "like",
        dayBucket: d.toISOString().slice(0, 10),
        createdAt: d,
      });
    }

    // דיסלייקים
    const dislikeUsers = faker.helpers.arrayElements(
      users.filter((u) => !likeUsers.includes(u)), // להימנע ממשתמש שגם לייק וגם דיסלייק (לסיד)
      Math.min(dislikes, Math.max(0, users.length - likeUsers.length))
    );
    for (const u of dislikeUsers) {
      const d = randDate();
      activities.push({
        dreamId: dream._id,
        userId: u._id,
        ipHash: null,
        type: "dislike",
        dayBucket: d.toISOString().slice(0, 10),
        createdAt: d,
      });
    }
  }

  if (activities.length) {
    await DreamActivity.insertMany(activities, { ordered: false });
    console.log(`✅ Inserted ${activities.length} DreamActivity items`);
  } else {
    console.log("No activities generated.");
  }
}
