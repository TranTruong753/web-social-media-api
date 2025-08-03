import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { hashPasswordHelper } from 'src/common/utils/utils';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    isEmailExist = async (email: string) => {
        const user = await this.userModel.exists({ email });
        if (user) return true;
        return false;
    }


    async create(createUserDto: CreateUserDto): Promise<User> {

        const { username, email, password, phone, avatar, bio, birthDate } = createUserDto;
        //check email
        const isExist = await this.isEmailExist(email);
        if (isExist === true) {
            throw new BadRequestException(`Email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`)
        }

        //hash password
        const hashPassword = await hashPasswordHelper(password);

        const user = new this.userModel({ username, email, password: hashPassword, phone, avatar, bio, birthDate });
        return user.save();
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const updateData: any = { ...updateUserDto };

        if (updateUserDto.password) {
            updateData.password = await hashPasswordHelper(updateUserDto.password);
        } else {
            delete updateData.password;
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
            { _id: id },
            updateData,
            { new: true }
        ).exec();

        if (!updatedUser) {
            throw new NotFoundException('Người dùng không tồn tại!');
        }

        return updatedUser

    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findByUsername(username: string): Promise<User[]> {
        return this.userModel.find({ username }).exec();
    }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById({ _id: id }).exec();
    }

    async delete(id: string): Promise<User | null> {
        const deleteUser = await this.userModel.findByIdAndDelete({ _id: id }).exec()

        return deleteUser
    }

    // API for Client
    async findAllByQuery(query: SearchUserDto): Promise<User[]> {
        const filter: any = {
            isDeleted: false
        };

        if (query.username) {
            filter.username = { $regex: query.username, $options: 'i' };
        }

        if (query.email) {
            filter.email = { $regex: query.email, $options: 'i' };
        }

        return this.userModel.find(filter).exec()
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email: email }).exec();
    }


}
