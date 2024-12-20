import { faker } from "@faker-js/faker";
import { connect, connection, Model } from "mongoose";
import * as dotenv from "dotenv";
import { User, UserSchema } from "../../modules/users/user.schema";
import { Product, ProductSchema } from "../../modules/products/product.schema";
import { UserRole } from "../../common/enums/roles.enum";
import {
  BandeCommande,
  BandeCommandeSchema,
} from "../../modules/bande-commande/bande-commande.schema";
import { CommandeStatus } from "../../common/enums/commande-status.enum";

dotenv.config();
const seedBandeCommande = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in the environment variables.");
  }

  await connect(process.env.MONGO_URI);

  const BandeCommandeModel: Model<BandeCommande> = connection.model(
    BandeCommande.name,
    BandeCommandeSchema,
  );
  const UserModel: Model<User> = connection.model("User", UserSchema);
  const ProduitModel: Model<Product> = connection.model(
    "Product",
    ProductSchema,
  );
  const products = await ProduitModel.find().lean();
  const users = await UserModel.find({
    role: UserRole.RestaurantManager,
  }).lean();
  if (products.length === 0 || users.length === 0) {
    throw new Error("Products wala Users ferghin 3abi kbal");
  }
  const fakeRecords = [];
  for (let i = 0; i < 6; i++) {
    const rand_p = products[Math.floor(Math.random() * products.length)]._id;
    const rand_u = users[Math.floor(Math.random() * users.length)]._id;
    const rand_s = faker.helpers.arrayElement(Object.values(CommandeStatus));
    fakeRecords.push({
      product: rand_p,
      caissier: rand_u,
      status: rand_s,
      quantity: faker.number.int({ min: 1, max: 200 }),
    });
  }
  await BandeCommandeModel.insertMany(fakeRecords);
  console.log("Zedna bande de commande eee");
  await connection.close();
};
seedBandeCommande().catch((error) =>
  console.error("Seeding Bande Commande failed: ", error),
);
