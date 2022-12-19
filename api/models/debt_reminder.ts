import { Schema, Document, model } from 'mongoose';

const debtReminderSchema = new Schema<DebtReminder>({
  id: { type: String, required: true, unique: true },
  sendPayAccount: { type: String, required: true },
  sendAccountName: { type: String, required: true },
  sendBankId: { type: String, required: true },
  sendBankName: { type: String, required: true },
  receiverPayAccount: { type: String, required: true },
  receiverAccountName: { type: String, required: true },
  receiverBankId: { type: String, required: true },
  receiverBankName: { type: String, required: true },
  payAccountFee: { type: String, required: true },
  transactionFee: { type: Number, required: true },
  amountOwed: { type: Number, required: true },
  description: { type: String },
  noticeTime: { type: Number, required: true },
  createTime: Number,
  updateTime: Number,
  _status: { type: Boolean, required: true }
}, { collection: 'debt_reminder' });

export interface DebtReminder extends Document {
  id: string,
  sendPayAccount: string,
  sendAccountName: string,
  sendBankId: string,
  sendBankName: string,
  receiverPayAccount: string,
  receiverAccountName: string,
  receiverBankId: string,
  receiverBankName: string,
  payAccountFee: string,
  transactionFee: number,
  amountOwed: number,
  description: string,
  noticeTime: number,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const DebtReminder = model<DebtReminder>('debt_reminder', debtReminderSchema);

export default DebtReminder;
