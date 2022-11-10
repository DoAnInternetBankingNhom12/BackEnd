import { Document, model, Schema } from 'mongoose';
import * as moment from 'moment';

const userSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: String,
  createTime: { type: Number, default: moment().unix() },
  updateTime: { type: Number, default: moment().unix() },
  _status: { type: Boolean, default: true }
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
