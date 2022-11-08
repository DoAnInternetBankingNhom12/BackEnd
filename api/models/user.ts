import { Document, model, Schema } from 'mongoose';

const userSchema = new Schema<User>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  refreshToken: String,
  createTime: Number,
  updateTime: Number,
  _status: Boolean
}, { collection: 'user' });

export interface User extends Document {
  id: string,
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
