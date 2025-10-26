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
  dreamId: string;
  title: string;
  isShared: boolean;
  views7d: number;
};
