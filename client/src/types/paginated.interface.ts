export interface PaginatedResponse<T> {
  data: T[]; // המוצרים עצמם
  total: number; // כמה סה״כ
  page: number; // העמוד הנוכחי
  limit: number; // כמה בעמוד
  totalPages: number; // כמה עמודים סה״כ
}
