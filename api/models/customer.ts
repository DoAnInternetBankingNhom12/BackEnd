import { Schema, Document, model } from "mongoose";

const customerSchema = new Schema<Customer>({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    accountBalance: { type: Number, required: true, default:50000 },
    paymentAccount: { type: String, required: true },
    createTime: Number,
    updateTime: Number,
    _status: { type: Boolean, required: true}
  }, { collection: 'customer' });

  export interface Customer extends Document {
    id: string,
    userId: string,
    name: string,
    isActive: boolean,
    accountBalance: number,
    paymentAccount: string,
    createTime: number,
    updateTime: number,
    _status: boolean
  };
  
  const Customer = model<Customer>('customer', customerSchema);
  
  export default Customer;
  