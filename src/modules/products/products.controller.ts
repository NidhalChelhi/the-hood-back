import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDTO } from "./dto/create-product.dto";
import { UpdateProductDTO } from "./dto/update-product.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { SupplyBatchService } from "../supply-batch/supply-batch.service";

@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly supplyBatchService: SupplyBatchService,
  ) {}

  @Roles("admin", "stock_manager")
  @Post()
  async create(@Body() createProductDTO: CreateProductDTO) {
    return this.productsService.createProduct(createProductDTO);
  }

  @Roles("admin", "stock_manager")
  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Roles("admin", "stock_manager")
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException("Product not found");
    }
    return product;
  }

  @Roles("admin", "stock_manager")
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProductDTO: UpdateProductDTO,
  ) {
    return this.productsService.updateProduct(id, updateProductDTO);
  }

  @Roles("admin")
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.productsService.deleteProduct(id);
    return { message: "Product deleted successfully" };
  }

  @Roles("admin", "stock_manager")
  @Get(":id/stock")
  async getStock(@Param("id") id: string) {
    return this.productsService.getProductStock(id);
  }

  @Roles("admin")
  @Get("value/total")
  async getProductsValue() {
    return this.productsService.getProductsValue();
  }

  @Roles("admin", "stock_manager")
  @Post(":id/retrieve-stock")
  async retrieveStock(
    @Param("id") productId: string,
    @Body("quantity") quantity: number,
  ) {
    return this.supplyBatchService.retrieveStock(productId, quantity);
  }
}
