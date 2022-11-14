import { Schema, Document, model } from "mongoose";

const roleSchema = new Schema<Role>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  createTime: Number,
  updateTime: Number,
  _status: Boolean
}, { collection: 'role' });

export interface Role extends Document {
  id: string,
  name: string,
  description: string,
  createTime: number,
  updateTime: number,
  _status: boolean
};

const Role = model<Role>('role', roleSchema);

export default Role;
