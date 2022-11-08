import * as dotenv from 'dotenv';
dotenv.config();

import * as mongoose from 'mongoose';

const setMongo = async (): Promise<any> => {
  const mongodbURI = process.env.MONGODB_URI as string;
  const dbName = process.env.DATABASE_NAME as string;
  await mongoose.connect(mongodbURI, { dbName });
  console.log(`Connected to MongoDB DB name ${dbName}`);
};

export default setMongo;