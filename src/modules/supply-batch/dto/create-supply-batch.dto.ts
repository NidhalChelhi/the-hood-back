import { IsNotEmpty, IsNumber, IsMongoId } from "class-validator";

export class CreateSupplyBatchDTO {
  @IsMongoId()
  @IsNotEmpty()
  product: string;

  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @IsNumber()
  @IsNotEmpty()
  sellingPriceGold: number;

  @IsNumber()
  @IsNotEmpty()
  sellingPriceSilver: number;

  @IsNumber()
  @IsNotEmpty()
  sellingPriceBronze: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
