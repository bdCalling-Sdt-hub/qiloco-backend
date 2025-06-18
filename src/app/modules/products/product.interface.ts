import mongoose, { Document, Types } from 'mongoose';
export interface IReview {
     userId: Types.ObjectId;
     rating: number;
     comment: string;
     date: Date;
}

export interface IProduct extends Document {
     userId: Types.ObjectId;
     name: string;
     description: string;
     price: number;
     quality: string;
     quantity: number;
     moodTag: string[];
     potency: string;
     genetics: string;
     origin: string;
     type: string;
     scent: string;
     image: string[];
     reviews: IReview[];
     isDeleted: boolean;
}
