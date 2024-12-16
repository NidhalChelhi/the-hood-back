import { IsEnum, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";
import { CommandeStatus } from "src/common/enums/commande-status.enum";

export class CreateBandeCommandeDto {
    @IsMongoId()
    @IsNotEmpty()
    product : string;

    @IsMongoId()
    @IsNotEmpty()
    caissier : string;

    @IsNumber()
    @IsNotEmpty()
    quantity : number;

    @IsEnum(CommandeStatus)
    status : CommandeStatus;
}
