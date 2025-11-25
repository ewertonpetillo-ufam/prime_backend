import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("../../entities/user.entity").User>;
    findAll(role?: UserRole): Promise<import("../../entities/user.entity").User[]>;
    getCurrentUser(user: {
        userId: string;
    }): Promise<import("../../entities/user.entity").User>;
    findOne(id: string): Promise<import("../../entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<import("../../entities/user.entity").User>;
    remove(id: string): Promise<void>;
}
