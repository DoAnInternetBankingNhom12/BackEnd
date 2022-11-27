import { Schema, Document, model } from 'mongoose';

const transactionSchema = new Schema<Transaction>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  receiverId: { type: String, required: true },
  receivingBankId: { type: String, required: true },
  amountOwed: { type: Number, required: true },
  description: { type: String },
  status: { type: String, required: true},
  typeTransaction: { type: String, required: true},
  createTime: Number,
  updateTime: Number,
  _status: Boolean
}, { collection: 'transaction' });

export interface Transaction extends Document {
  id: string,
  userId: string,
  receiverId: string,
  receivingBankId: string,
  amountOwed: number,
  description: string,
  status: string, // transferring: Đang chuyển tiền, completed: Chuyển tiền thành công, failed: Chuyển thất bại, not_yet_delivered: Chưa giao tiền, delivered: Đã giao tiền
  typeTransaction: string // internal: Trong ngân hàng, external: Ngoài ngân hàng
  createTime: number,
  updateTime: number,
  _status: boolean
};

const Transaction = model<Transaction>('transaction', transactionSchema);

export default Transaction;
