import { Document, model, Schema } from 'mongoose';
import * as moment from 'moment';

const receiverSchema = new Schema<Receiver>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  reminiscentName: { type: String },
  idUser: { type: String, required: true},
  idBank: { type: String, required: true},
  remittanceType: { type: String, required: true},
  numberAccount: { type: String, required: true },
  createTime: { type: Number, default: moment().unix() },
  updateTime: { type: Number, default: moment().unix() },
  _status: { type: Boolean, default: true }
}, { collection: 'receiver' });

export interface Receiver extends Document {
  id: string,
  name: string,
  reminiscentName: string,
  idUser: string,
  idBank: string,
  remittanceType: string,
  numberAccount: string,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const Receiver = model<Receiver>('receiver', receiverSchema);

export default Receiver;
