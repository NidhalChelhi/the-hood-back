import { Module } from "@nestjs/common";
import { CommandeService } from "./commande.service";
import { CommandeController } from "./commande.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Commande, CommandeSchema } from "./commande.schema";
import {
  BandeCommande,
  BandeCommandeSchema,
} from "../bande-commande/bande-commande.schema";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commande.name, schema: CommandeSchema },
      { name: BandeCommande.name, schema: BandeCommandeSchema },
    ]),
    ProductsModule,
  ],
  controllers: [CommandeController],
  providers: [CommandeService],
})
export class CommandeModule {}
