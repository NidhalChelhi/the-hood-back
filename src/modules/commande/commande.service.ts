import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Commande } from "./commande.schema";
import { Model } from "mongoose";
import { BandeCommande } from "../bande-commande/bande-commande.schema";
import { BandeCommandeService } from "../bande-commande/bande-commande.service";
import { CreateCommandeDto } from "./dto/create-commande.dto";
import { ProductsService } from "../products/products.service";
import { CommandeStatus } from "src/common/enums/commande-status.enum";

@Injectable()
export class CommandeService {
  constructor(
    @InjectModel(Commande.name) private CommandeModel: Model<Commande>,
    @InjectModel(BandeCommande.name)
    private BandeCommandeModel: Model<BandeCommande>,
    private readonly bandeCommandeService: BandeCommandeService,
    private readonly productService: ProductsService,
  ) {}

  async createCommande(createCommandeDto: CreateCommandeDto) {
    try {
      const order = new this.CommandeModel(createCommandeDto);
      return await order.save();
    } catch (e) {
      Logger.error("Unvalidated arguments : ", e);
      throw new BadRequestException("Unvalid data");
    }
  }
  async findById(userId: string, userRole: string, id: string) {
    const commande = await this.CommandeModel.findById(id).exec();
    if (!commande) {
      throw new NotFoundException("Commande not found");
    }
    if (
      commande.bandeCommandes[0].caissier.toString() != userId &&
      userRole !== "admin"
    ) {
      throw new UnauthorizedException("Commande does not belong to user");
    }
    return commande;
  }

  async findForUser(userId: string) {
    const commandes = await this.CommandeModel.find({
      "bandeCommandes.caissier": userId,
    }).exec();
    if (!commandes) {
      return new NotFoundException("Cannot find any commands for this cashier");
    }
    return commandes;
  }

  async getCommandeStatus(id: string) {
    const commande = await this.CommandeModel.findById(id).exec();
    return commande.bandeCommandes.map((bc) => bc.status);
  }

  async refuseCommande(id: string) {
    const commande = await this.CommandeModel.findByIdAndUpdate(id, {
      "bandeCommandes.$.status": CommandeStatus.Rejected,
    }).exec();
    if (!commande) {
      throw new NotFoundException("Commande not found");
    }
  }
  async validateCommande(id: string) {
    const commande = await this.CommandeModel.findById(id).exec();
    if (!commande) {
      throw new NotFoundException("Commande not found");
    }
    const consumedStocks = commande.bandeCommandes.map(async (bc) => {
      const bandeCommande = await this.BandeCommandeModel.findById(
        bc._id,
      ).exec();
      const totalStock = await this.productService.getProductStock(
        bandeCommande.product._id.toString(),
      );
      if (totalStock < bandeCommande.quantity) {
        const commandeProductInfo = await this.productService.retrieveStock(
          bandeCommande.product._id.toString(),
          totalStock,
        );
        //TODO send mail for the missing quantity;
        await this.BandeCommandeModel.findByIdAndUpdate(bc._id, {
          status: CommandeStatus.PendingNotEnoughStock,
        });
        return commandeProductInfo;
      } else {
        const commandeProductInfo = await this.productService.retrieveStock(
          bandeCommande.product._id.toString(),
          bandeCommande.quantity,
        );
        await this.BandeCommandeModel.findByIdAndUpdate(bc._id, {
          status: CommandeStatus.Accepted,
        });
        return commandeProductInfo;
      }
    });
    return {
      caissier: commande.bandeCommandes[0].caissier._id.toString(),
      commandeInfo: consumedStocks,
    };
  }
  async deleteCommande(userId: string, id: string) {
    if (
      (
        await this.CommandeModel.findById(id)
      ).bandeCommandes[0].caissier.toString() !== userId
    ) {
      throw new UnauthorizedException("Commande doesn't belong to the user");
    }
    await this.CommandeModel.findByIdAndDelete(id).exec();
  }
}
