import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SupplyBatch } from "./supply-batch.schema";
import { CreateSupplyBatchDTO } from "./dto/create-supply-batch.dto";
import { UpdateSupplyBatchDTO } from "./dto/update-supply-batch.dto";
import { ProductsService } from "../products/products.service";
import { Product } from "../products/product.schema";

@Injectable()
export class SupplyBatchService {
  constructor(
    @InjectModel(SupplyBatch.name)
    private supplyBatchModel: Model<SupplyBatch>,
    private productsService: ProductsService,
    @InjectModel(Product.name)
    private productModel: Model<Product> // Inject Product Model
  ) {}

  async createSupplyBatch(
    createSupplyBatchDTO: CreateSupplyBatchDTO
  ): Promise<SupplyBatch> {
    const supplyBatch = new this.supplyBatchModel(createSupplyBatchDTO);
    const savedBatch = await supplyBatch.save();

    await this.productsService.updateProductSupplyBatches(
      createSupplyBatchDTO.product,
      savedBatch._id.toString()
    );

    return savedBatch;
  }

  async findAll(): Promise<SupplyBatch[]> {
    return this.supplyBatchModel.find().populate("product").exec();
  }

  async findById(id: string): Promise<SupplyBatch> {
    const supplyBatch = await this.supplyBatchModel
      .findById(id)
      .populate("product")
      .exec();

    if (!supplyBatch) {
      throw new NotFoundException("Supply Batch not found");
    }
    return supplyBatch;
  }

  async updateSupplyBatch(
    id: string,
    updateSupplyBatchDTO: UpdateSupplyBatchDTO
  ): Promise<SupplyBatch> {
    const updatedBatch = await this.supplyBatchModel.findByIdAndUpdate(
      id,
      updateSupplyBatchDTO,
      { new: true, runValidators: true }
    );

    if (!updatedBatch) {
      throw new NotFoundException("Supply Batch not found");
    }
    return updatedBatch;
  }

  async deleteSupplyBatch(id: string): Promise<void> {
    const result = await this.supplyBatchModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException("Supply Batch not found");
    }
  }

  // TODO: Remove the supply batch id from the product's supplyBatches array when it's fully used up
  async retrieveStock(productId: string, quantity: number) {
    const product = await this.productModel
      .findById(productId)
      .populate<{ supplyBatches: SupplyBatch[] }>({
        path: "supplyBatches",
        model: "SupplyBatch",
      })
      .exec();

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    let remainingQuantity = quantity;
    const usedBatches = [];

    for (const batch of product.supplyBatches) {
      if (remainingQuantity <= 0) break;

      const usedQuantity = Math.min(batch.quantity, remainingQuantity);

      usedBatches.push({
        batchId: batch._id,
        quantityUsed: usedQuantity,
        purchasePrice: batch.purchasePrice,
      });

      // Update or remove batch
      const updatedBatch = await this.supplyBatchModel.findByIdAndUpdate(
        batch._id,
        { $inc: { quantity: -usedQuantity } },
        { new: true }
      );

      if (updatedBatch && updatedBatch.quantity <= 0) {
        await this.productModel.updateOne(
          { _id: productId },
          { $pull: { supplyBatches: updatedBatch._id.toString() } }
        );

        // Delete the supply batch document
        await this.supplyBatchModel.findByIdAndDelete(updatedBatch._id);
      }

      remainingQuantity -= usedQuantity;
    }

    if (remainingQuantity > 0) {
      throw new BadRequestException("Not enough stock available");
    }

    return { productName: product.name, usedBatches };
  }
}
