import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class SupplyBatch extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: "Product" })
  product: Types.ObjectId;

  @Prop({ required: true })
  purchasePrice: number;

  @Prop({ required: true })
  sellingPriceGold: number;

  @Prop({ required: true })
  sellingPriceSilver: number;

  @Prop({ required: true })
  sellingPriceBronze: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: Date.now })
  dateAdded: Date;
}

export const SupplyBatchSchema = SchemaFactory.createForClass(SupplyBatch);
