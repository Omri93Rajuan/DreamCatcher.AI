export type LoginDto = {
    email: string;
    password: string;
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
export type CreateDreamDto = {
    title: string;
    userInput: string;
    aiResponse: string;
    isShared?: boolean;
    sharedAt?: string | null;
};
export interface DreamsPage {
    dreams: Dream[];
    total: number;
    page: number;
    pages: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}
export type InterpretDto = {
    text?: string;
    userInput?: string;
    prompt?: string;
    dream_text?: string;
    save?: boolean;
    isShared?: boolean;
    model?: string;
    titleOverride?: string;
};
export type InterpretResponse = {
    title: string | null;
    aiResponse: string;
    dream?: Dream | null;
};
export type DreamCategory = "flying" | "falling" | "being_chased" | "teeth" | "exam" | "late" | "death" | "romance" | "work" | "school" | "family" | "animals" | "water" | "house" | "vehicle" | "travel" | "lost" | "monster" | "paralysis" | "lucid";
export type CategoryScores = Partial<Record<DreamCategory | string, number>>;
export interface Dream {
    _id: string;
    userId: string;
    title: string;
    userInput: string;
    aiResponse: string;
    isShared: boolean;
    sharedAt?: string | null;
    categories?: DreamCategory[];
    categoryScores?: CategoryScores;
    createdAt: string;
    updatedAt: string;
}
export type GlobalDreamStats = {
    totalAll: number;
    totalPublic: number;
    newSince: number;
    publishedSince: number;
    uniqueUsers: number;
    windowDays: number;
    sinceISO?: string;
};
export type UserRole = "admin" | "user";
export type SubscriptionType = "free" | "premium";
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    subscription: SubscriptionType;
    image?: string;
    lastLogin?: string | Date;
    isActive?: boolean;
    subscriptionExpiresAt?: string | Date;
    termsAccepted?: boolean;
    termsAcceptedAt?: string | Date;
    termsVersion?: string;
    termsIp?: string | null;
    termsUserAgent?: string | null;
    termsLocale?: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
export type UpdateUserDTO = Partial<Omit<User, "_id" | "email" | "role" | "subscription" | "termsAccepted" | "termsAcceptedAt" | "termsVersion" | "termsIp" | "termsUserAgent" | "termsLocale">>;
export type Article = {
    id: string;
    title: string;
    author: string;
    content: string;
    excerpt?: string;
    coverUrl?: string;
    authorAvatar?: string;
    publishedAt?: string;
    tags?: string[];
};
