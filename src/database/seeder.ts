import * as bcrypt from "bcrypt";
import  { connect, connection, Model } from "mongoose";
import { User, UserSchema } from "../modules/users/user.schema";
import * as dotenv from "dotenv";

dotenv.config();

const seedUsers = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in the environment variables.");
  }

  await connect(process.env.MONGO_URI);

  const UserModel: Model<User> = connection.model("User", UserSchema);

  const users = [
    {
      username: "admin",
      password: await bcrypt.hash("AdminPass123", 10),
      role: "admin",
      email: "admin@example.com",
    },
    {
      username: "stock_manager",
      password: await bcrypt.hash("StockPass123", 10),
      role: "stock_manager",
      email: "stockmanager@example.com",
    },
    {
      username: "manager1",
      password: await bcrypt.hash("ManagerPass123", 10),
      role: "restaurant_manager",
      email: "manager1@example.com",
      phoneNumber: "123456789",
      location: {
        name: "Restaurant A",
        rank: "gold",
        address: "123 Gold Street",
      },
    },
    {
      username: "manager2",
      password: await bcrypt.hash("ManagerPass456", 10),
      role: "restaurant_manager",
      email: "manager2@example.com",
      phoneNumber: "987654321",
      location: {
        name: "Restaurant B",
        rank: "silver",
        address: "456 Silver Avenue",
      },
    },
    {
      username: "manager3",
      password: await bcrypt.hash("ManagerPass789", 10),
      role: "restaurant_manager",
      email: "manager3@example.com",
      phoneNumber: "456789123",
      location: {
        name: "Restaurant C",
        rank: "bronze",
        address: "789 Bronze Road",
      },
    },
  ];

  for (const user of users) {
    await UserModel.create(user);
    console.log(`Created user: ${user.username}`);
  }

  console.log("Seeding completed!");
  connection.close();
};

seedUsers().catch((error) => console.error("Seeding failed:", error));
