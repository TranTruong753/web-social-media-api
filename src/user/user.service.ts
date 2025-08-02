import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existing = await this.userModel.findOne({ email: createUserDto.email })

        if (existing)
            throw new ConflictException('Email đã tồn tại!')

        const user = new this.userModel(createUserDto);
        return user.save();
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const updatedUser = await this.userModel.findByIdAndUpdate({ _id: id }, updateUserDto, {
            new: true
        }).exec()

        if (!updatedUser) {
            throw new NotFoundException('Người dùng không tồn tại!');
        }

        return updatedUser;
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

    escapeRegex(text: string): string {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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

    async delete(id: string): Promise<User | null> {
        const deleteUser = await this.userModel.findByIdAndDelete({ _id: id }).exec()

        return deleteUser
    }
}
