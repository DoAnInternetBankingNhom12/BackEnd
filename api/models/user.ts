import { Document, model, Schema } from 'mongoose';

const userSchema = new Schema<User>({
  idUser: Number,
  name: String,
  userName: String,
  password: String,
  refreshToken: String,
  createTime: Number,
  updateTime: Number,
  _status: Boolean
}, { collection: 'user' });

interface User extends Document {
  idUser: number,
  name: string,
  userName: string,
  password: string,
  refreshToken: string,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const User = model<User>('user', userSchema);

export default User;
