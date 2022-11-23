import { Schema, Document, model } from 'mongoose';

const bankSchema = new Schema<Bank>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  phoneNumbers: { type: [String]},
  addresses: { type: [String]},
  createTime: Number,
  updateTime: Number,
  _status: Boolean
}, { collection: 'bank' });

export interface Bank extends Document {
  id: string,
  name: string,
  phoneNumbers: string[],
  addresses: string[],
  createTime: number,
  updateTime: number,
  _status: boolean
};

const Bank = model<Bank>('bank', bankSchema);

export default Bank;
