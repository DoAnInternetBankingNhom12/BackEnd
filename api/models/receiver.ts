import { Document, model, Schema } from 'mongoose';
import * as moment from 'moment';

const receiverSchema = new Schema<Receiver>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  reminiscentName: { type: String },
  userId: { type: String, required: true},
  bankId: { type: String, required: true},
  remittanceType: { type: String, required: true},
  paymentAccount: { type: String, required: true },
  createTime: { type: Number, default: moment().unix() },
  updateTime: { type: Number, default: moment().unix() },
  _status: { type: Boolean, default: true }
}, { collection: 'receiver' });

export interface Receiver extends Document {
  id: string,
  name: string,
  reminiscentName: string,
  userId: string,
  bankId: string,
  remittanceType: string,
  paymentAccount: string,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const Receiver = model<Receiver>('receiver', receiverSchema);

export default Receiver;
