export type Dream = {
  _id: string;
  userId: string;
  title: string;
  userInput: string;
  aiResponse: string;
  isShared: boolean;
  sharedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginDto = { email: string; password: string };
export type User = { _id: string; name: string; email: string; role?: string };

export type CreateDreamDto = Pick<
  Dream,
  "title" | "userInput" | "aiResponse" | "isShared" | "sharedAt"
>;
export type InterpretDto = { userInput: string };
export type InterpretResponse = { title?: string | null; aiResponse: string };

export type DreamsPage = {
  dreams: Dream[];
  total: number;
  page: number;
  pages: number;
};
export type PopularRow = {
  rank: number;
  dreamId: string;
  title: string;
  coverImage?: string | null;
  excerpt?: string | null;
  isShared: boolean;
  views: number;
  likes: number;
  score: number;
  percentChange: number | null;
  series?: SeriesPoint[];
};
export type SeriesPoint = {
  day: string;
  views: number;
  likes: number;
  score: number;
};

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export enum SubscriptionType {
  Free = "free",
  Premium = "premium",
}

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  subscription: SubscriptionType;
  image?: string;
  lastLogin?: Date;
  isActive?: boolean;
  subscriptionExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
