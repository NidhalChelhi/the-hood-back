import { Module } from '@nestjs/common';
import { BandeCommandeService } from './bande-commande.service';
import { BandeCommandeController } from './bande-commande.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../products/product.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports : [
    MongooseModule.forFeature([
      { name : Product.name, schema: ProductSchema},
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [BandeCommandeController],
  providers: [BandeCommandeService],
  exports: [BandeCommandeService]
})
export class BandeCommandeModule {}
