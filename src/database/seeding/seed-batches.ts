import { faker } from "@faker-js/faker";
import { connect, connection, Model, Types } from "mongoose";
import * as dotenv from "dotenv";
import { Product, ProductSchema } from "../../modules/products/product.schema";
import {
  SupplyBatch,
  SupplyBatchSchema,
} from "../../modules/supply-batch/supply-batch.schema";

dotenv.config();

const seedBatches = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in the environment variables.");
  }

  await connect(process.env.MONGO_URI);

  const ProduitModel: Model<Product> = connection.model(
    "Product",
    ProductSchema,
  );
  const BatchModel: Model<SupplyBatch> = connection.model(
    SupplyBatch.name,
    SupplyBatchSchema,
  );

  const products = await ProduitModel.find().lean();
  for (let i = 0; i < products.length * 5; i++) {
    const fake_p = products[Math.floor(Math.random() * products.length)]._id;
    const fake_purchase_price = faker.number.int({ min: 1, max: 10 });
    const fake_gold_price = faker.number.int({ min: 1, max: 10 });
    const fake_silver_price = faker.number.int({ min: 1, max: 10 });
    const fake_bronze_price = faker.number.int({ min: 1, max: 10 });
    const fake_q = faker.number.int({ min: 100, max: 900, multipleOf: 100 });
    const batchP = await BatchModel.create({
      product: fake_p,
      purchasePrice: fake_purchase_price,
      sellingPriceGold: fake_gold_price,
      sellingPriceSilver: fake_silver_price,
      sellingPriceBronze: fake_bronze_price,
      quantity: fake_q,
    });
    console.log(batchP);
    await ProduitModel.findByIdAndUpdate(
      new Types.ObjectId(fake_p.toString()),
      {
        $push: { supplyBatches: batchP._id.toString() },
      },
    );
  }
  console.log("Eeee seedina l batches");
  connection.close();
};

seedBatches().catch((error) =>
  console.error("Erreur fl supply batch seeding : ", error),
);
