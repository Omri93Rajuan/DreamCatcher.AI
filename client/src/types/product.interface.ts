import { ICategory } from "./categoty.interface";
export interface IProduct {
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: ICategory;
    stock: number;
    images: string[];
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}
