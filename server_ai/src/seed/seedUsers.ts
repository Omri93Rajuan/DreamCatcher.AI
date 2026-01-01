import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import User from "../models/user";
import { SubscriptionType, UserRole } from "../types/users.interface";

async function seedUsers(count: number = 10) {
  const existing = await User.find();
  if (existing.length > 0) {
    console.log("Users already exist, skipping...");
    return existing;
  }

  const users = [];
  const adminPlain =
    process.env.SEED_ADMIN_PASSWORD || faker.internet.password({ length: 14 });
  const adminPassword = await bcrypt.hash(adminPlain, 10);

  users.push({
    firstName: "System",
    lastName: "Admin",
    email: "admin@example.com",
    password: adminPassword,
    role: UserRole.Admin,
    subscription: SubscriptionType.Premium,
    image: faker.image.avatar(),
    balance: 0,
    lastLogin: new Date(),
  });

  for (let i = 0; i < count - 1; i++) {
    const password = await bcrypt.hash("123456", 10);
    users.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password,
      role: UserRole.User,
      subscription: faker.helpers.arrayElement([
        SubscriptionType.Free,
        SubscriptionType.Premium,
      ]),
      image: faker.image.avatar(),
      balance: faker.number.int({ min: 0, max: 5000 }),
      lastLogin: faker.date.recent({ days: 30 }),
    });
  }

  const created = await User.insertMany(users);
  console.log(`バ. Inserted ${created.length} fake users`);
  console.log(
    "Seed admin credentials",
    JSON.stringify({ email: "admin@example.com", password: adminPlain })
  );
  return created;
}

export default seedUsers;
