import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SupplyBatchService } from "./supply-batch.service";
import { SupplyBatchController } from "./supply-batch.controller";
import { SupplyBatch, SupplyBatchSchema } from "./supply-batch.schema";
import { ProductsModule } from "../products/products.module";
import { Product, ProductSchema } from "../products/product.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupplyBatch.name, schema: SupplyBatchSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [SupplyBatchController],
  providers: [SupplyBatchService],
  exports: [SupplyBatchService],
})
export class SupplyBatchModule {}
