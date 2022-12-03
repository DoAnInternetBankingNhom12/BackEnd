import { Document, model, Schema } from 'mongoose';
import * as moment from 'moment';

const userSchema = new Schema<User>({
  id: { type: String, required: true, unique: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, match: /.+\@.+\..+/, },
  password: { type: String, required: true },
  refreshToken: String,
  token: String,
  customer: Object,
  employee: Object,
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
  customer: Customer,
  employee: Employee,
  createTime: number,
  updateTime: number,
  _status: boolean
};

interface Customer {
  id: string,
  userId: string,
  name: string,
  accountBalance: number,
  paymentAccount: string,
};

interface Employee {
  id: string,
  userId: string,
  name: string,
  phoneNumbers: string,
  accountType: String,
};

const User = model<User>('user', userSchema);

export default User;
