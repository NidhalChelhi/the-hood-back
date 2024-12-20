import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Commande } from "./commande.schema";
import { Model } from "mongoose";
import { BandeCommande } from "../bande-commande/bande-commande.schema";
import { CreateCommandeDto } from "./dto/create-commande.dto";
import { ProductsService } from "../products/products.service";
import { CommandeStatus } from "src/common/enums/commande-status.enum";
import { User } from "../users/user.schema";
import { LocationRank } from "src/common/enums/location-rank.enum";


//TODO add options to populate each element of the array with the full field for product/user/supply batches for a more comprehensive view
@Injectable()
export class CommandeService {
  constructor(
    @InjectModel(Commande.name) private CommandeModel: Model<Commande>,
    @InjectModel(BandeCommande.name)
    private BandeCommandeModel: Model<BandeCommande>,
    private UserModel : Model<User>,
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

  //The function validates the commande by filtering every single product (as a bandeCommande object) updating it's status depending on the available stock
  // It calculates the total price based on the location of the restaurant, then returns the quantity that is accepted this for the case of the stock quantity being less than the demanded quantity

  async validateCommande(id: string) {
    const commande = await this.CommandeModel.findById(id).exec();
    if (!commande) {
      throw new NotFoundException("Commande not found");
    }
    const caissier = commande.bandeCommandes[0].caissier._id.toString();
    const caissierUserObject = await this.UserModel.findById(caissier).exec();
    const location = caissierUserObject.location;
    if(!location){
      throw new InternalServerErrorException("User has no location ?? ");
    }
    const consumedStocksPromise = () => { 
      const promise = commande.bandeCommandes.map(async (bc) => {
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
        //TODO send mail for the missing quantity
        //Missing quantity is bandeCommande.quantity - totalStock
        await this.BandeCommandeModel.findByIdAndUpdate(bc._id, {
          status: CommandeStatus.PendingNotEnoughStock,
        });
        return {
          ...commandeProductInfo,
          status : CommandeStatus.PendingNotEnoughStock
        };
      } else {
        const commandeProductInfo = await this.productService.retrieveStock(
          bandeCommande.product._id.toString(),
          bandeCommande.quantity,
        );
        await this.BandeCommandeModel.findByIdAndUpdate(bc._id, {
          status: CommandeStatus.Accepted,
        });
        return {
          ...commandeProductInfo,
          status : CommandeStatus.PendingNotEnoughStock
        };
      }
    })
    return Promise.all(promise);
  };
    const consumedStocks = await consumedStocksPromise();
    let totalPrice = 0;
    const productInfo = consumedStocks.map((product) => {
      const {price , quantity} = product.usedBatches.map((batch) => {
        switch(location.rank){
          case LocationRank.Bronze : {
           return {
            price :batch.quantityUsed *  batch.bronzePrice,
            quantity : batch.quantityUsed
          }
          }
          case LocationRank.Silver : {
           return {
            price :batch.quantityUsed *  batch.silverPrice,
            quantity : batch.quantityUsed
          }
          }
          case LocationRank.Gold : {
           return {
            price :batch.quantityUsed *  batch.goldPrice,
            quantity : batch.quantityUsed
          }
          }
          default : {
            throw new NotImplementedException("Location rank doesn't exist yet");
          }
        }
      }).reduce((acc, curr) => {
        return {
          price : acc.price + curr.price,
          quantity : acc.quantity + curr.quantity
        }
      });
      totalPrice += price;
      return {
        productName : product.productName,
        quantity,
        price,
        status : product.status
      }
    })
    return {
      caissier: commande.bandeCommandes[0].caissier._id.toString(),
      commandeInfo: productInfo,
      totalPrice
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
