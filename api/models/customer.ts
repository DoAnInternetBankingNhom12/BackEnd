import { Schema, Document, model } from "mongoose";

const customerSchema = new Schema<Customer>({
    id: { type: String, required: true, unique: true },
    idUser: { type: String, required: true },
    accountBalance: { type: Number, required: true, default:50000 },
    paymentAccount: { type: String, required: true },
    createTime: Number,
    updateTime: Number,
    _status: Boolean
  }, { collection: 'customer' });

  export interface Customer extends Document {
    id: string,
    idUser: string,
    accountBalance: number,
    paymentAccount: string,
    createTime: number,
    updateTime: number,
    _status: boolean
  };
  
  const Customer = model<Customer>('customer', customerSchema);
  
  export default Customer;
  