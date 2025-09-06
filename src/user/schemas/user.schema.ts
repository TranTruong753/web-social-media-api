// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  password: string;

  @Prop({ required: true, unique: true })
  email?: string;

  @Prop()
  bio?: string;

  @Prop()
  avatar?: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  phone?: string;

  @Prop({ default: "USERS" })
  role: string;

  @Prop({ default: false })
  isActive?: boolean;

  @Prop({ default: false })
  isOnline?: boolean;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  codeId: string;

  @Prop()
  codeExpired: Date;

  @Prop()
  tokenHash: string

}

export const UserSchema = SchemaFactory.createForClass(User);
