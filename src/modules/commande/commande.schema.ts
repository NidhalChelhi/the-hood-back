import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { BandeCommande } from "../bande-commande/bande-commande.schema";

@Schema({ timestamps: true })
export class Commande {
  @Prop({
    type: [BandeCommande],
    validate: {
      validator: (bandeCommandes: BandeCommande[]) => {
        if (!bandeCommandes || bandeCommandes.length == 0) {
          return true;
        }
        const caissier = bandeCommandes[0].caissier.toString();
        return bandeCommandes.every(
          (bandeCommande) => bandeCommande.caissier.toString() == caissier,
        );
      },
      message:
        "Les bandes commandes l kol lezem andhom nafs l ID taa l caissier",
    },
    required: true,
    ref: BandeCommande.name,
  })
  bandeCommandes: BandeCommande[];
}

export const CommandeSchema = SchemaFactory.createForClass(Commande);
