import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { hashPasswordHelper } from 'src/common/utils/utils';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) { }

    isEmailExist = async (email: string) => {
        const user = await this.userModel.exists({ email });
        if (user) return true;
        return false;
    }


    async create(createUserDto: CreateUserDto): Promise<UserDocument> {

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

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email: email }).exec();
    }

    async handleRegister(user) {
        try {
            const { username, email, password, bio, birthDate, phone } = user

            //check email
            const isExist = await this.isEmailExist(email);
            if (isExist === true) {
                throw new BadRequestException(`Email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`)
            }

            //hash password
            const hashPassword = await hashPasswordHelper(password);

            const codeId = uuidv4();

            const codeExpired = dayjs().add(30, 's').toDate();

            const createdUser = await this.userModel.create({
                username,
                email,
                password: hashPassword,
                bio,
                phone,
                birthDate,
                isActive: false,
                codeId: codeId,
                codeExpired
            })

            // send email
            this.mailerService
                .sendMail({
                    to: createdUser.email, // list of receivers
                    subject: 'Testing Nest MailerModule ✔', // Subject line
                    text: 'welcome', // plaintext body
                    template: "register",
                    context: {
                        name: createdUser?.username ?? createdUser.email,
                        activationCode: createdUser.codeId
                    }

                })

            return {
                message: 'Email đã được gửi code hãy chuyển qua trang active',
                user: {
                    id: createdUser._id,
                    username: createdUser.username,
                    email: createdUser.email,
                    isActive: createdUser.isActive,
                    codeId: createdUser.codeId,
                    codeExpired: createdUser.codeExpired
                },
            };
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }


    async handleRegisterWithGmail(user) {
        try {
            const { username, email } = user
            const codeId = uuidv4();

            const codeExpired = dayjs().add(30, 's').toDate();

            const createdUser = await this.userModel.create({
                username,
                email,
                isActive: false,
                codeId: codeId,
                codeExpired
            })

            // send email
            this.mailerService
                .sendMail({
                    to: createdUser.email, // list of receivers
                    subject: 'Testing Nest MailerModule ✔', // Subject line
                    text: 'welcome', // plaintext body
                    template: "register",
                    context: {
                        name: createdUser?.username ?? createdUser.email,
                        activationCode: createdUser.codeId
                    }

                })

            return {
                message: 'Email đã được gửi code hãy chuyển qua trang active',
                user: {
                    id: createdUser._id,
                    username: createdUser.username,
                    email: createdUser.email,
                    isActive: createdUser.isActive,
                    codeId: createdUser.codeId,
                    codeExpired: createdUser.codeExpired
                },
            };
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async sendCodeId(user) {
        try {
            const codeId = uuidv4();

            const expireValue = this.configService.get<number>('CODE_EXPIRE_VALUE', 30);
            const expireUnit = this.configService.get<string>('CODE_EXPIRE_UNIT', 's');

            const codeExpired = dayjs().add(expireValue, expireUnit as dayjs.ManipulateType).toDate();

            // send email
            this.mailerService
                .sendMail({
                    to: user.email, // list of receivers
                    subject: 'Testing Nest MailerModule ✔', // Subject line
                    text: 'welcome', // plaintext body
                    template: "register",
                    context: {
                        name: user?.username ?? user.email,
                        activationCode: user.codeId
                    }

                })

            return {
                message: 'Chuyển qua trang Active!',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isActive: user.isActive,
                    codeId,
                    codeExpired
                }
            }


        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

}
