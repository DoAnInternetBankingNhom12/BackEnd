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
import auth from './middleware/auth.customer.middleware';
import authEmployee from './middleware/auth.employee.middleware';
import authAdmin from './middleware/auth.admin.middleware';
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
  router.route('/users').get(authEmployee, userCtrl.getAllUser);
  router.route('/user/:id').get(auth, userCtrl.getUser);
  router.route('/myinfo').get(auth, userCtrl.getUserInfo);
  router.route('/users/count').get(authEmployee, userCtrl.count);
  router.route('/user/changepws').post(auth, userCtrl.changePassword);
  router.route('/user/forgotpws').post(auth, otp, userCtrl.forgotPassword);
  router.route('/user').post(authEmployee, userCtrl.createUser);
  router.route('/user/customer').post(authEmployee, userCtrl.createUserCustommer);
  router.route('/user/employee').post(authAdmin, userCtrl.createUserEmployee);
  router.route('/user/admin').post(authAdmin, userCtrl.createUserAdmin);
  router.route('/user/:id').put(authAdmin, userCtrl.update);
  router.route('/user/:id').delete(authAdmin, userCtrl.deleteUser);

  // Bank
  router.route('/banks').get(authAdmin, bankCtrl.getAll);
  router.route('/banks/count').get(authAdmin, bankCtrl.count);
  router.route('/bank/:id').get(authAdmin, bankCtrl.get);
  router.route('/bank').post(authAdmin, bankCtrl.insert);
  router.route('/bank/:id').put(authAdmin, bankCtrl.update);
  router.route('/bank/:id').delete(authAdmin, bankCtrl.delete);

  // Customer
  router.route('/customers').get(authEmployee, customerCtrl.getAll);
  router.route('/customers/count').get(authEmployee, customerCtrl.count);
  router.route('/customer/:id').get(authEmployee, customerCtrl.get);
  router.route('/customer').post(authEmployee, customerCtrl.createCustomer);
  router.route('/customer/recharge').post(authEmployee, customerCtrl.recharge);
  router.route('/customer/:id').put(authEmployee, customerCtrl.updateCustomer);
  router.route('/customer/:id').delete(authEmployee, customerCtrl.deleteCustomer);

  // Employee
  router.route('/employees').get(authAdmin, employeeCtrl.getAll);
  router.route('/employees/count').get(authAdmin, employeeCtrl.count);
  router.route('/employee/:id').get(authAdmin, employeeCtrl.get);
  router.route('/employee').post(authAdmin, employeeCtrl.createEmployee);
  router.route('/employee/:id').put(authAdmin, employeeCtrl.updateEmployee);
  router.route('/employee/:id').delete(authAdmin, employeeCtrl.deleteEmployee);

  // Role
  router.route('/roles').get(authAdmin, roleCtrl.getAll);
  router.route('/roles/count').get(authAdmin, roleCtrl.count);
  router.route('/role/:id').get(authAdmin, roleCtrl.get);
  router.route('/role').post(authAdmin, roleCtrl.insert);
  router.route('/role/:id').put(authAdmin, roleCtrl.update);
  router.route('/role/:id').delete(authAdmin, roleCtrl.delete);

  // Receiver
  router.route('/receivers').get(auth, receiverCtrl.getAll);
  router.route('/myreceiver').get(auth, receiverCtrl.getReceiverByToken);
  router.route('/receivers/count').get(auth, receiverCtrl.count);
  router.route('/receiver/:id').get(auth, receiverCtrl.get);
  router.route('/receiver').post(auth, receiverCtrl.createReceiver);
  router.route('/receiver/:id').put(auth, receiverCtrl.updateReceiver);
  router.route('/receiver/:id').delete(auth, receiverCtrl.delete);

  // Transaction
  router.route('/transactions').get(transactionCtrl.getAll);
  router.route('/transactions/count').get(transactionCtrl.count);
  router.route('/transaction').get(transactionCtrl.findTransaction);
  router.route('/transaction').post(transactionCtrl.insert);
  router.route('/transaction/:id').put(transactionCtrl.update);
  router.route('/transaction/:id').delete(transactionCtrl.delete);

  // Login || Logout
  router.route('/login').post(userCtrl.login);
  router.route('/loginrt').post(userCtrl.loginRT);
  router.route('/logout').post(userCtrl.logout);

  // OTP
  router.route('/otp').get(auth, otpCtrl.sendOtp);
  router.route('/otp/:userName').get(otpCtrl.sendOtpByUserName);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
