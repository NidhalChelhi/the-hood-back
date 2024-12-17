import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { CommandeStatus } from "../../common/enums/commande-status.enum";

@Schema({ timestamps : true })
export class BandeCommande extends Document {
    @Prop({ required : true, type : Types.ObjectId, ref : "Product"})
    product : Types.ObjectId;

    @Prop({required : true})
    quantity : number;

    @Prop({ required : true, type : Types.ObjectId, ref : "User"})
    caissier : Types.ObjectId;

    @Prop({required : true, enum : Object.values(CommandeStatus)})
    status : CommandeStatus;
}

export const BandeCommandeSchema = SchemaFactory.createForClass(BandeCommande)