export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  orders: any[];
  role: string;
  subscription: string;
  image?: string;
}
