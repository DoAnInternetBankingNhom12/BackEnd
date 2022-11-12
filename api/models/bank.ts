import { Schema, Document, model } from 'mongoose';

const bankShema = new Schema<Bank>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  phoneNumbers: { type: String, required: true },
  addresses: { type: String, required: true },
  createTime: Number,
  updateTime: Number,
  _status: Boolean
}, { collection: 'bank' });

export interface Bank extends Document {
  id: string,
  name: string,
  phoneNumbers: string,
  addresses: string,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const Bank = model<Bank>('bank', bankShema);

export default Bank;