import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "./product.schema";
import { CreateProductDTO } from "./dto/create-product.dto";
import { UpdateProductDTO } from "./dto/update-product.dto";
import { SupplyBatch } from "../supply-batch/supply-batch.schema";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
    private supplyBatchModel: Model<SupplyBatch>,
  ) {}

  async createProduct(createProductDTO: CreateProductDTO): Promise<Product> {
    const product = new this.productModel(createProductDTO);
    return product.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().populate("supplyBatches").exec();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate("supplyBatches")
      .exec();

    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  async updateProduct(
    id: string,
    updateProductDTO: UpdateProductDTO,
  ): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDTO,
      { new: true, runValidators: true },
    );
    if (!updatedProduct) {
      throw new NotFoundException("Product not found");
    }
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException("Product not found");
    }
  }

  async getProductStock(productId: string): Promise<number> {
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

    if (!product.supplyBatches || product.supplyBatches.length === 0) {
      Logger.error("Supply batches not populated or empty");
      return 0;
    }

    const totalStock = product.supplyBatches.reduce((sum, batch) => {
      Logger.debug(`Batch Quantity: ${batch.quantity}`);
      return sum + (batch.quantity || 0);
    }, 0);

    Logger.log(`Total stock for product ${product.name}: ${totalStock}`);
    return totalStock;
  }

  async updateProductSupplyBatches(productId: string, batchId: string) {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      { $push: { supplyBatches: batchId } },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      throw new NotFoundException("Product not found");
    }
  }

  async getProductsValue(): Promise<
    { productName: string; totalValue: number }[]
  > {
    const products = await this.productModel
      .find()
      .populate<{ supplyBatches: SupplyBatch[] }>({
        path: "supplyBatches",
        model: "SupplyBatch",
      })
      .exec();

    if (!products || products.length === 0) {
      throw new NotFoundException("No products found");
    }

    const productValues = products.map((product) => {
      const totalValue = product.supplyBatches.reduce((sum, batch) => {
        return sum + batch.purchasePrice * batch.quantity;
      }, 0);

      return {
        productName: product.name,
        totalValue,
      };
    });

    return productValues;
  }
  async retrieveStock(productId: string, quantity: number) {
    //TODO : add a transaction to roll back in case of insufficient stock
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
        batchId: batch._id.toString(),
        quantityUsed: usedQuantity,
        purchasePrice: batch.purchasePrice,
      });

      // Update or remove batch
      const updatedBatch = await this.supplyBatchModel.findByIdAndUpdate(
        batch._id,
        { $inc: { quantity: -usedQuantity } },
        { new: true },
      );

      if (updatedBatch && updatedBatch.quantity <= 0) {
        await this.productModel.updateOne(
          { _id: productId },
          { $pull: { supplyBatches: updatedBatch._id.toString() } },
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
    // TODO : Check if all the stock for the product if used up, if so, send a notification to the admin
  }
}
