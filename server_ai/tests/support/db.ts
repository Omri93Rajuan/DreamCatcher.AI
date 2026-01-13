import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer | null = null;

export async function connectTestDb() {
  if (mongoose.connection.readyState === 1) return;
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "jest" } as any);
}

export async function clearTestDb() {
  if (mongoose.connection.readyState !== 1) return;
  await mongoose.connection.db.dropDatabase();
}

export async function closeTestDb() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}



