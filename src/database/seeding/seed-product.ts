import {faker} from '@faker-js/faker'
import { connect, connection, Model } from "mongoose";
import * as dotenv from "dotenv";
import { Product, ProductSchema } from "../../modules/products/product.schema";

dotenv.config();
const seedProducts = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in the environment variables.");
  }

  await connect(process.env.MONGO_URI);

  const ProduitModel : Model<Product> = connection.model("Product", ProductSchema);

  const fakeRecords = [];
  const unique_names = new Set<string>();
  for(let i = 0; i < 20; i++){
    let fake_n = faker.string.alpha({ length : {min : 5, max : 10}});
    while(unique_names.has(fake_n)){
        fake_n = faker.string.alpha({ length : {min : 5, max : 10}});
    }
    
    const fake_d = faker.string.alpha({ length : {min : 5, max : 10}});
    const fake_unit = faker.string.alpha({length : {min : 1, max : 3}});

    fakeRecords.push({
        name : fake_n,
        description : fake_d,
        unit : fake_unit
    });
  }
  await ProduitModel.insertMany(fakeRecords);
  console.log("Khatfet l insertion eeeee");
  connection.close();
}

seedProducts().catch((error) => console.error("Cannot seed Products : ", error));