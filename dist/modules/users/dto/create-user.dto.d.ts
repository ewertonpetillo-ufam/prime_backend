import { UserRole } from '../../../entities/user.entity';
export declare class CreateUserDto {
    full_name: string;
    email: string;
    password_hash?: string;
    role?: UserRole;
    registration_number?: string;
    specialty?: string;
    phone?: string;
    active?: boolean;
    first_login?: boolean;
    last_login?: Date;
}
