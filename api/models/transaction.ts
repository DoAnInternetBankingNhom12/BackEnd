import { Schema, Document, model } from 'mongoose';

const transactionSchema = new Schema<Transaction>({
  id: { type: String, required: true, unique: true },
  sendPayAccount: { type: String, required: true },
  sendBankId: { type: String, required: true },
  receiverPayAccount: { type: String, required: true },
  receiverBankId: { type: String, required: true },
  payAccountFee: { type: String, required: true },
  transactionFee: { type: Number, required: true },
  amountOwed: { type: Number, required: true },
  description: { type: String },
  statusTransaction: { type: String, required: true},
  statusMoney: { type: String, required: true},
  typeTransaction: { type: String, required: true},
  createTime: Number,
  updateTime: Number,
  _status: { type: Boolean, required: true}
}, { collection: 'transaction' });

export interface Transaction extends Document {
  id: string,
  sendPayAccount: string,
  sendBankId: string,
  receiverPayAccount: string,
  receiverBankId: string,
  payAccountFee: string,
  transactionFee: number,
  amountOwed: number,
  description: string,
  statusTransaction: string, // transferring: Đang chuyển tiền, completed: Chuyển tiền thành công, failed: Chuyển thất bại.
  statusMoney: string, // not_delivered: Chưa giao tiền, delivered: Đã giao tiền
  typeTransaction: string // internal: Trong ngân hàng, external: Ngoài ngân hàng
  createTime: number,
  updateTime: number,
  _status: boolean
};

const Transaction = model<Transaction>('transaction', transactionSchema);

export default Transaction;
