import { User } from "@/user/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";


export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userPost: User;

    @Prop()
    content: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'File' })
    urlImg?: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'File' })
    urlVideo?: mongoose.Types.ObjectId;


    @Prop({ default: false })
    isDeleted?: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
