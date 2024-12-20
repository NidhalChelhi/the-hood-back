import { Injectable, NotFoundException } from "@nestjs/common";
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
    private productModel: Model<Product>, // Inject Product Model
  ) {}

  async createSupplyBatch(
    createSupplyBatchDTO: CreateSupplyBatchDTO,
  ): Promise<SupplyBatch> {
    const supplyBatch = new this.supplyBatchModel(createSupplyBatchDTO);
    const savedBatch = await supplyBatch.save();

    await this.productsService.updateProductSupplyBatches(
      createSupplyBatchDTO.product,
      savedBatch._id.toString(),
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
    updateSupplyBatchDTO: UpdateSupplyBatchDTO,
  ): Promise<SupplyBatch> {
    const updatedBatch = await this.supplyBatchModel.findByIdAndUpdate(
      id,
      updateSupplyBatchDTO,
      { new: true, runValidators: true },
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
}
