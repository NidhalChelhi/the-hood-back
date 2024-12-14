import {
  Post,
  Get,
  Patch,
  Delete,
  Controller,
  Param,
  Body,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdateUserDTO } from "./dto/update-user.dto";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Create a new user (Admin only)
  @Roles("admin")
  @Post()
  async create(@Body() createUserDTO: CreateUserDTO) {
    return this.usersService.createUser(createUserDTO);
  }

  // Get all users (Admin, Stock Manager)
  @Roles("admin", "stock_manager")
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  // Get user by ID (Admin only)
  @Roles("admin")
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  // Update a user by ID (Admin only)
  @Roles("admin")
  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDTO: UpdateUserDTO) {
    // Ensure location is only set for restaurant_manager users
    return this.usersService.updateUser(id, updateUserDTO);
  }

  // Delete a user by ID (Admin only)
  @Roles("admin")
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.usersService.deleteUser(id);
    return { message: "User deleted successfully" };
  }
}
