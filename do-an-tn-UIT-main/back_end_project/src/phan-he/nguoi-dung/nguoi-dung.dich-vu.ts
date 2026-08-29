import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { TaoNguoiDungDto } from './dto/tao-nguoi-dung.dto';
import { CapNhatNguoiDungDto } from './dto/cap-nhat-nguoi-dung.dto';
import { chayBoQuaLoc } from '../../dung-chung/da-cua-hang/ngu-canh-cua-hang';

@Injectable()
export class DichVuNguoiDung {
  private readonly logger = new Logger(DichVuNguoiDung.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: TaoNguoiDungDto): Promise<UserDocument> {
    // Email là định danh đăng nhập, duy nhất trên toàn hệ thống chứ không riêng
    // từng cửa hàng — nên phải kiểm tra ngoài phạm vi cửa hàng hiện tại.
    const existingUser = await chayBoQuaLoc(() =>
      this.userModel.findOne({ email: createUserDto.email }).exec(),
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    this.logger.log(`User created: ${savedUser.email}`);

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /** Lấy user kèm password (dùng nội bộ để xác thực đổi mật khẩu). */
  async findOneWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Tìm theo email cho luồng đăng nhập — chưa biết cửa hàng nên phải tra toàn hệ thống.
   * `storeId` của user tìm được sẽ được nạp vào ngữ cảnh ngay sau đó.
   */
  async findByEmail(email: string): Promise<UserDocument> {
    return chayBoQuaLoc(() => this.userModel.findOne({ email }).exec());
  }

  /**
   * Tra người dùng theo id trên toàn hệ thống — chỉ dùng cho xác thực JWT,
   * thời điểm mà ngữ cảnh cửa hàng chưa được thiết lập.
   */
  async timTheoIdToanHeThong(id: string): Promise<UserDocument | null> {
    return chayBoQuaLoc(() => this.userModel.findById(id).exec());
  }

  async update(id: string, updateUserDto: CapNhatNguoiDungDto): Promise<User> {
    const updateData: any = { ...updateUserDto };

    // Vai trò cố định – không cho phép đổi qua API (chỉ tạo mới mới set role)
    delete updateData.role;

    if (updateUserDto.password && updateUserDto.password.trim()) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete updateData.password;
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User updated: ${user.email}`);
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User deleted: ${result.email}`);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { lastLogin: new Date() })
      .exec();
  }

  /**
   * Cập nhật thông tin cá nhân (fullName, phone, password) - dùng cho tự cập nhật profile.
   * Không cho phép đổi role, isActive.
   */
  async updateProfile(
    id: string,
    data: { fullName?: string; phone?: string; password?: string },
  ): Promise<User> {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName.trim();
    if (data.phone !== undefined) updateData.phone = data.phone.trim() || undefined;
    if (data.password && data.password.trim()) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.logger.log(`User profile updated: ${user.email}`);
    return user;
  }
}

