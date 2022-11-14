import { Document, model, Schema } from 'mongoose';
import * as moment from 'moment';

const userSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/, },
  password: { type: String, required: true },
  refreshToken: String,
  token: String,
  createTime: { type: Number, default: moment().unix() },
  updateTime: { type: Number, default: moment().unix() },
  _status: { type: Boolean, default: true }
}, { collection: 'user' });

export interface User extends Document {
  id: string,
  userName: string,
  email: string,
  password: string,
  refreshToken: string,
  token: string,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const User = model<User>('user', userSchema);

export default User;
