// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  email?: string;

  @Prop()
  bio?: string;

  @Prop()
  avatar?: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  phone?: string;

  @Prop()
  isActive?: boolean;

  @Prop()
  isDeleted?: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);
