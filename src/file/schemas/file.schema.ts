import { TypeFile } from "@/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type FileDocument = HydratedDocument<File>;

@Schema({ timestamps: true })
export class File {

    @Prop()
    name: string

    @Prop()
    path: string

    @Prop({
        type: String,
        enum: TypeFile,
    })
    type: string

    @Prop({ default: false })
    isOwned?: boolean;

    @Prop({ default: false })
    isDeleted?: boolean;
}

export const FileSchema = SchemaFactory.createForClass(File);
