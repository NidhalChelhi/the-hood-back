import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from "@nestjs/common";
import { CommandeService } from "./commande.service";
import { CreateCommandeDto } from "./dto/create-commande.dto";
import { Roles } from "src/common/decorators/roles.decorator";

@Controller("commande")
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @Roles("restaurant_manager")
  @Post()
  async create(@Req() req, @Body() createCommandeDto: CreateCommandeDto) {
    return await this.commandeService.createCommande(createCommandeDto);
  }

  @Roles("restaurant_manager", "admin")
  @Get(":id")
  async findById(@Req() req, @Param("id") id: string) {
    return await this.commandeService.findById(
      req.user?.userId,
      req.user?.userId,
      id,
    );
  }
  @Roles("restaurant_manager", "admin")
  @Get("resto/:id")
  async findForUser(@Param("id") id: string) {
    return await this.commandeService.findForUser(id);
  }

  @Roles("restaurant_manager")
  @Get("status/:id")
  async getStatus(@Param("id") id: string) {
    return await this.commandeService.getCommandeStatus(id);
  }

  @Roles("stock_manager", "admin")
  @Post("validate/:id")
  async validateCommande(@Param() id: string) {
    return await this.commandeService.validateCommande(id);
  }

  @Roles("stock_manager", "admin")
  @Post("refuse/:id")
  async refuseCommande(@Param() id: string) {
    await this.commandeService.refuseCommande(id);
  }

  @Roles("restaurant_manager")
  @Delete(":id")
  remove(@Req() req, @Param("id") id: string) {
    return this.commandeService.deleteCommande(req.user?.userId, id);
  }
}
