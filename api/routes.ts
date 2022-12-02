import { Router, Application } from 'express';

// Controllers
import UserCtrl from './controllers/user.controller';
import BankCtrl from './controllers/bank.controller';
import CustomerCtrl from './controllers/customer.controller';
import EmployeeCtrl from './controllers/employee.controller';
import RoleCtrl from './controllers/role.controller';
import ReceiverCtrl from './controllers/receiver.controller';
import TransactionCtrl from './controllers/transaction.controller';
import OTPCtrl from './controllers/otp.controller';

// Middlewares
import auth from './middleware/auth.middleware';
import otp from './middleware/otp.middleware';

const setRoutes = (app: Application): void => {
  const router = Router();
  const userCtrl = new UserCtrl();
  const bankCtrl = new BankCtrl();
  const customerCtrl = new CustomerCtrl();
  const employeeCtrl = new EmployeeCtrl();
  const roleCtrl = new RoleCtrl();
  const receiverCtrl = new ReceiverCtrl();
  const transactionCtrl = new TransactionCtrl();
  const otpCtrl = new OTPCtrl();

  // User
  router.route('/users').get(userCtrl.getAllUser);
  router.route('/user/:id').get(userCtrl.getUser);
  router.route('/users/count').get(userCtrl.count);
  router.route('/user/changepws').post(userCtrl.changePassword);
  router.route('/user/forgotpws').post(otp, userCtrl.forgotPassword);
  router.route('/user').post(userCtrl.createUser);
  router.route('/user/customer').post(userCtrl.createUserCustommer);
  router.route('/user/employee').post(userCtrl.createUserEmployee);
  router.route('/user/admin').post(userCtrl.createUserAdmin);
  router.route('/user/:id').put(userCtrl.update);
  router.route('/user/:id').delete(userCtrl.deleteUser);

  // Bank
  router.route('/banks').get(bankCtrl.getAll);
  router.route('/banks/count').get(bankCtrl.count);
  router.route('/bank/:id').get(bankCtrl.get);
  router.route('/bank').post(bankCtrl.insert);
  router.route('/bank/:id').put(bankCtrl.update);
  router.route('/bank/:id').delete(bankCtrl.delete);

  // Customer
  router.route('/customers').get(customerCtrl.getAll);
  router.route('/customers/count').get(customerCtrl.count);
  router.route('/customer/:id').get(customerCtrl.get);
  router.route('/customer').post(customerCtrl.createCustomer);
  router.route('/customer/recharge').post(customerCtrl.recharge);
  router.route('/customer/:id').put(customerCtrl.updateCustomer);
  router.route('/customer/:id').delete(customerCtrl.deleteCustomer);

  // Employee
  router.route('/employees').get(employeeCtrl.getAll);
  router.route('/employees/count').get(employeeCtrl.count);
  router.route('/employee/:id').get(employeeCtrl.get);
  router.route('/employee').post(employeeCtrl.createEmployee);
  router.route('/employee/:id').put(employeeCtrl.updateEmployee);
  router.route('/employee/:id').delete(employeeCtrl.deleteEmployee);

  // Role
  router.route('/roles').get(roleCtrl.getAll);
  router.route('/roles/count').get(roleCtrl.count);
  router.route('/role/:id').get(roleCtrl.get);
  router.route('/role').post(roleCtrl.insert);
  router.route('/role/:id').put(roleCtrl.update);
  router.route('/role/:id').delete(roleCtrl.delete);

  // Receiver
  router.route('/receivers').get(receiverCtrl.getAll);
  router.route('/receivers/count').get(receiverCtrl.count);
  router.route('/receiver/:id').get(receiverCtrl.get);
  router.route('/receiver').post(receiverCtrl.createReceiver);
  router.route('/receiver/:id').put(receiverCtrl.updateReceiver);
  router.route('/receiver/:id').delete(receiverCtrl.delete);

  // Transaction
  router.route('/transactions').get(transactionCtrl.getAll);
  router.route('/transactions/count').get(transactionCtrl.count);
  router.route('/transaction').get(transactionCtrl.findTransaction);
  router.route('/transaction').post(transactionCtrl.insert);
  router.route('/transaction/:id').put(transactionCtrl.update);
  router.route('/transaction/:id').delete(transactionCtrl.delete);

  // Login || Logout
  router.route('/login').get(userCtrl.login);
  router.route('/loginrt').get(userCtrl.loginRT);
  router.route('/logout').get(userCtrl.logout);

  // OTP
  router.route('/otp').get(otpCtrl.sendOtp);
  router.route('/otp/:userName').get(otpCtrl.sendOtpByUserName);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
