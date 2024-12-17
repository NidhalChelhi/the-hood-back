import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from "@nestjs/common";
import { BandeCommandeService } from "./bande-commande.service";
import { CreateBandeCommandeDto } from "./dto/create-bande-commande.dto";
import { UpdateBandeCommandeDto } from "./dto/update-bande-commande.dto";
import { Roles } from "src/common/decorators/roles.decorator";

@Controller("bande-commande")
export class BandeCommandeController {
  constructor(private readonly bandeCommandeService: BandeCommandeService) {}

  @Roles("restaurant_manager")
  @Post()
  async create(@Body() createBandeCommandeDto: CreateBandeCommandeDto) {
    return await this.bandeCommandeService.createBandeCommande(
      createBandeCommandeDto
    );
  }

  @Roles("admin", "stock_manager")
  @Get()
  async findAll() {
    return await this.bandeCommandeService.findAll();
  }

  @Roles("admin", "stock_manager")
  @Get(":id")
  async findOne(
    @Param("id") id: string
  ) {
    return await this.bandeCommandeService.findById(id);
  }

  @Roles("restaurant_manager")
  @Get("own/:id")
  async findOwnOne(
    @Param("id") id : string,
    @Req() req : any
  ){
    return await this.bandeCommandeService.findOwnById(id, req.user?.userId);
  }

  @Roles("restaurant_manager", "stock_manager", "admin")
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Req() req : any,
    @Body() updateBandeCommandeDto: UpdateBandeCommandeDto
  ) {
    return await this.bandeCommandeService.updateBandeCommande(
      id,
      updateBandeCommandeDto,
      req.user?.role,
    );
  }

  @Roles("restaurant_manager", "stock_manager", "admin")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.bandeCommandeService.deleteBandeCommande(id);
  }
}
