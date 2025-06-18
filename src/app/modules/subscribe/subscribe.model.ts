import mongoose, { Schema } from 'mongoose';

export interface IEmail {
     email: string;
     subscribed: boolean;
}

const emailSchema = new Schema<IEmail>({
     email: {
          type: String,
          required: true,
          unique: true,
          match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
          index: true,
     },
     subscribed: {
          type: Boolean,
          default: true,
     },
});

export const Subscribe = mongoose.model<IEmail>('Subscribe', emailSchema);
