import { Schema, Document, model } from 'mongoose';

const debtReminderSchema = new Schema<DebtReminder>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  sendPayAccount: { type: String, required: true },
  receiverPayAccount: { type: String, required: true },
  typeFee: { type: String, required: true },
  amountOwed: { type: Number, required: true },
  status: { type: String, required: true, default: 'unpaid' },
  description: { type: String },
  descriptionCancel: { type: String },
  noticeTime: { type: Number, required: true },
  createTime: Number,
  updateTime: Number,
  _status: { type: Boolean, required: true }
}, { collection: 'debt_reminder' });

export interface DebtReminder extends Document {
  id: string,
  userId: string,
  sendPayAccount: string,
  receiverPayAccount: string,
  typeFee: string,
  amountOwed: number,
  status: string, // unpaid: chưa thanh toán, paid: đã thanh toán, cancelled: hủy bỏ
  description: string,
  descriptionCancel: string
  noticeTime: number,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const DebtReminder = model<DebtReminder>('debt_reminder', debtReminderSchema);
export default DebtReminder;
