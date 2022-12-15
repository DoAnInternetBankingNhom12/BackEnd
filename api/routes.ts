import { Router, Application } from 'express';

// Controllers
import UserCtrl from './controllers/user.controller';
import BankCtrl from './controllers/bank.controller';
import CustomerCtrl from './controllers/customer.controller';
import EmployeeCtrl from './controllers/employee.controller';
import ReceiverCtrl from './controllers/receiver.controller';
import TransactionCtrl from './controllers/transaction.controller';
import OTPCtrl from './controllers/otp.controller';

// Middlewares
import auth from './middleware/auth.customer.middleware';
import authEmployee from './middleware/auth.employee.middleware';
import authAdmin from './middleware/auth.admin.middleware';
import authSK from './middleware/authSK.middleware';
import otp from './middleware/otp.middleware';

const setRoutes = (app: Application): void => {
  const router = Router();
  const userCtrl = new UserCtrl();
  const bankCtrl = new BankCtrl();
  const customerCtrl = new CustomerCtrl();
  const employeeCtrl = new EmployeeCtrl();
  const receiverCtrl = new ReceiverCtrl();
  const transactionCtrl = new TransactionCtrl();
  const otpCtrl = new OTPCtrl();

  // User
  router.route('/users').get(auth, userCtrl.getAllUser);
  router.route('/user/:id').get(auth, userCtrl.getUser);
  router.route('/myinfo').get(auth, userCtrl.getUserInfo);
  router.route('/users/count').get(auth, userCtrl.count);
  router.route('/user/changepws').post(auth, userCtrl.changePassword);
  router.route('/user/forgotpws').post(auth, otp, userCtrl.forgotPassword);
  router.route('/user').post(auth, userCtrl.createUser);
  router.route('/user/customer').post(auth, userCtrl.createUserCustommer);
  router.route('/user/employee').post(auth, userCtrl.createUserEmployee);
  router.route('/user/admin').post(auth, userCtrl.createUserAdmin);
  router.route('/user/:id').put(auth, userCtrl.update);
  router.route('/user/:id').delete(auth, userCtrl.deleteUser);

  // Bank
  router.route('/banks').get(auth, bankCtrl.getAll);
  router.route('/banks/count').get(auth, bankCtrl.count);
  router.route('/bank/:id').get(auth, bankCtrl.get);
  router.route('/bank').post(auth, bankCtrl.insert);
  router.route('/bank/:id').put(auth, bankCtrl.update);
  router.route('/bank/:id').delete(auth, bankCtrl.delete);

  // Customer
  router.route('/customers').get(auth, customerCtrl.getAll);
  router.route('/customers/count').get(auth, customerCtrl.count);
  router.route('/customer/:id').get(auth, customerCtrl.get);
  router.route('/customerpaynumber/:paymentAccount').get(auth, customerCtrl.getCustomerByPayNumber);
  router.route('/customer').post(auth, customerCtrl.createCustomer);
  router.route('/customer/recharge').post(auth, customerCtrl.recharge);
  router.route('/customer/:id').put(auth, customerCtrl.updateCustomer);
  router.route('/customer/:id').delete(auth, customerCtrl.deleteCustomer);

  // Employee
  router.route('/employees').get(auth, employeeCtrl.getAll);
  router.route('/employees/count').get(auth, employeeCtrl.count);
  router.route('/employee/:id').get(auth, employeeCtrl.get);
  router.route('/employee').post(auth, employeeCtrl.createEmployee);
  router.route('/employee/:id').put(auth, employeeCtrl.updateEmployee);
  router.route('/employee/:id').delete(auth, employeeCtrl.deleteEmployee);

  // Receiver
  router.route('/receivers').get(auth, receiverCtrl.getAll);
  router.route('/myreceiver').get(auth, receiverCtrl.getReceiverByToken);
  router.route('/receivers/count').get(auth, receiverCtrl.count);
  router.route('/receiver/:id').get(auth, receiverCtrl.get);
  router.route('/receiver').post(auth, receiverCtrl.createReceiver);
  router.route('/receiver/:id').put(auth, receiverCtrl.updateReceiver);
  router.route('/receiver/:id').delete(auth, receiverCtrl.delete);

  // Transaction
  router.route('/transactions').get(authEmployee, transactionCtrl.getAll);
  router.route('/transactions/count').get(authEmployee, transactionCtrl.count);
  router.route('/transaction').get(authEmployee, transactionCtrl.findTransaction);
  router.route('/transaction/internal').post(auth, transactionCtrl.internalBank);
  // router.route('/transaction/external').post(auth, transactionCtrl.externalBank); // External done but has not api from Partner
  router.route('/transaction/:id').put(authAdmin, transactionCtrl.update);
  router.route('/transaction/:id').delete(authAdmin, transactionCtrl.delete);

  // Login || Logout
  router.route('/login').post(userCtrl.login);
  router.route('/loginrt').post(userCtrl.loginRT);
  router.route('/logout').post(userCtrl.logout);

  // OTP
  router.route('/otp').get(auth, otpCtrl.sendOtp);
  router.route('/otp/:userName').get(otpCtrl.sendOtpByUserName);

  // Public Api
  router.route('/getInfo/:paymentAccount').get(authSK, customerCtrl.getCustomerByPayNumber);
  router.route('/addmoney').post(authSK, transactionCtrl.externalBank);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
