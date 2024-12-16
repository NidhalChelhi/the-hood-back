import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBandeCommandeDto } from './dto/create-bande-commande.dto';
import { UpdateBandeCommandeDto } from './dto/update-bande-commande.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BandeCommande } from './bande-commande.schema';
import { Model } from 'mongoose';
import { Product } from '../products/product.schema';
import { UserRole } from 'src/common/enums/roles.enum';

@Injectable()
export class BandeCommandeService {
  constructor(
    @InjectModel(BandeCommande.name)
    private bandeCommandeModel : Model<BandeCommande>,
    @InjectModel(Product.name)
    private productModel : Model<Product>
  ){}
  async createBandeCommande(
    createBandeCommandeDto: CreateBandeCommandeDto
  ) : Promise<BandeCommande> {
    const bandeCommande = new this.bandeCommandeModel(createBandeCommandeDto);
    const saved = bandeCommande.save();
    return saved;
  }

  findAll() {
    return this.bandeCommandeModel.find().exec();
  }

  async findById(
    id: string, 
  ) {
    const bandeCommande = await this.bandeCommandeModel
      .findById(id)
      .exec();
    if(!bandeCommande){
      throw new NotFoundException("Bande Commande Not Found");
    }
    return bandeCommande;
  }

  async findOwnById(
    id : string,
    userId : string | undefined
  ){
    if(!userId){
       throw new UnauthorizedException("No manager Id provided"); 
    }
    const bandeCommande = await this.bandeCommandeModel
      .findById(id)
      .exec();
    if(!bandeCommande){
      throw new NotFoundException("Bande Commande Not Found");
    }
    if(bandeCommande.caissier.toString() != userId){
      throw new UnauthorizedException("Bande Commande is for another manager");
    }
    return bandeCommande;
  }

  async updateBandeCommande(
      id: string,
      updateBandeCommandeDto: UpdateBandeCommandeDto,
      role : string
    ) : Promise<BandeCommande> {
      if(role == UserRole.StockManager && updateBandeCommandeDto.quantity){
          throw new ForbiddenException("Stock manager cannot update quantity");
      }
      if(role == UserRole.RestaurantManager && updateBandeCommandeDto.status){
          throw new ForbiddenException("Restaurant manager cannot update status");
      }
      const updatedBandeCommande= await this.bandeCommandeModel
        .findByIdAndUpdate(
          id,
          updateBandeCommandeDto,
          { new : true, runValidators : true}
        );
      if(!updatedBandeCommande){
        throw new NotFoundException("Bande Commande not found");
      }
      return updatedBandeCommande;
  }

  async deleteBandeCommande(id: string) : Promise<void>{
    const result = await this.bandeCommandeModel.findByIdAndDelete(id);
    if(!result){
      throw new NotFoundException("Bande Commande not found");
    }
  }
}
