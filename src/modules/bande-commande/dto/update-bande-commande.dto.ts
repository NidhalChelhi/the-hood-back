import { IsNumber, IsEnum } from 'class-validator';
import { CommandeStatus } from 'src/common/enums/commande-status.enum';

export class UpdateBandeCommandeDto  {
    @IsNumber()
    quantity : number;

    @IsEnum(CommandeStatus)
    status : CommandeStatus;
}
