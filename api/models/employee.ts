import { Schema, Document, model } from "mongoose";

const employeeSchema = new Schema<Employee>({
    id: { type: String, required: true, unique: true },
    idCustomer: { type: String, required: true },
    name: {type: String, required: true },
    phoneNumbers: { type: String, required: true },
    accountType: { type: String, required: true },
    createTime: Number,
    updateTime: Number,
    _status: Boolean
}, { collection: 'employee' });

export interface Employee extends Document {
    id: string,
    idCustomer: string,
    name: string,
    phoneNumbers: string,
    accountType: String,
    createTime: number,
    updateTime: number,
    _status: boolean
};

const Employee = model<Employee>('employee', employeeSchema);

export default Employee;
