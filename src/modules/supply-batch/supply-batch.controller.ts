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
import { SupplyBatchService } from "./supply-batch.service";
import { CreateSupplyBatchDTO } from "./dto/create-supply-batch.dto";
import { UpdateSupplyBatchDTO } from "./dto/update-supply-batch.dto";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("supply-batches")
export class SupplyBatchController {
  constructor(private readonly supplyBatchService: SupplyBatchService) {}

  @Roles("admin", "stock_manager")
  @Post()
  async create(@Body() createSupplyBatchDTO: CreateSupplyBatchDTO) {
    return this.supplyBatchService.createSupplyBatch(createSupplyBatchDTO);
  }

  @Roles("admin", "stock_manager")
  @Get()
  async findAll() {
    return this.supplyBatchService.findAll();
  }

  @Roles("admin", "stock_manager")
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const supplyBatch = await this.supplyBatchService.findById(id);
    if (!supplyBatch) {
      throw new NotFoundException("Supply Batch not found");
    }
    return supplyBatch;
  }

  @Roles("admin", "stock_manager")
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateSupplyBatchDTO: UpdateSupplyBatchDTO,
  ) {
    return this.supplyBatchService.updateSupplyBatch(id, updateSupplyBatchDTO);
  }

  @Roles("admin")
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.supplyBatchService.deleteSupplyBatch(id);
    return { message: "Supply Batch deleted successfully" };
  }
}
