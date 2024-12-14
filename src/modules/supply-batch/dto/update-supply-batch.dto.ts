import { PartialType } from "@nestjs/mapped-types";
import { CreateSupplyBatchDTO } from "./create-supply-batch.dto";

export class UpdateSupplyBatchDTO extends PartialType(CreateSupplyBatchDTO) {}
