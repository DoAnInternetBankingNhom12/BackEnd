import { Router, Application } from 'express';

// Controllers
import UserCtrl from './controllers/user.controller';
import BankCtrl from './controllers/bank.controller';
import CustomerCtrl from './controllers/customer.controller';
import EmployeeCtrl from './controllers/employee.controller';
import ReceiverCtrl from './controllers/receiver.controller';
import TransactionCtrl from './controllers/transaction.controller';
import OTPCtrl from './controllers/otp.controller';
import PartnerCtrl from './controllers/partner.controller';
import DebtReminderCtrl from './controllers/debt_reminder.controller';

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
  const partnerCtrl = new PartnerCtrl();
  const debtReminderCtrl = new DebtReminderCtrl();

  // User
  router.route('/users').get(authEmployee, userCtrl.getAllUser);
  router.route('/user/:id').get(authEmployee, userCtrl.getUser);
  router.route('/myinfo').get(auth, userCtrl.getUserInfo);
  router.route('/users/count').get(authEmployee, userCtrl.count);
  router.route('/user/changepws').post(auth, userCtrl.changePassword);
  router.route('/user/forgotpws').post(otp, userCtrl.forgotPassword);
  router.route('/user').post(authEmployee, userCtrl.createUser);
  router.route('/user/customer').post(authEmployee, userCtrl.createUserCustommer);
  router.route('/user/employee').post(authAdmin, userCtrl.createUserEmployee);
  router.route('/user/admin').post(authAdmin, userCtrl.createUserAdmin);
  router.route('/user/:id').put(authEmployee, userCtrl.update);
  router.route('/user/:id').delete(authEmployee, userCtrl.deleteUser);

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
  router.route('/customerpaynumber/:paymentAccount').get(auth, customerCtrl.getCustomerByPayNumber);
  router.route('/customer').post(authEmployee, customerCtrl.createCustomer);
  router.route('/customer/recharge').post(authEmployee, customerCtrl.recharge);
  router.route('/customer/:id').put(authEmployee, customerCtrl.updateCustomer);
  router.route('/activecustomer/:id').put(auth, customerCtrl.activeCustomer);
  router.route('/inactivecustomer/:id').put(auth, customerCtrl.inactiveCustomer);
  router.route('/customer/:id').delete(authEmployee, customerCtrl.deleteCustomer);

  // Employee
  router.route('/employees').get(authAdmin, employeeCtrl.getAll);
  router.route('/employees/count').get(authAdmin, employeeCtrl.count);
  router.route('/employee/:id').get(authAdmin, employeeCtrl.get);
  router.route('/employee').post(authAdmin, employeeCtrl.createEmployee);
  router.route('/employee/:id').put(authAdmin, employeeCtrl.updateEmployee);
  router.route('/employee/:id').delete(authAdmin, employeeCtrl.deleteEmployee);

  // Receiver
  router.route('/receivers').get(auth, receiverCtrl.getAll);
  router.route('/myreceiver').get(auth, receiverCtrl.getReceiverByToken);
  router.route('/receivers/count').get(auth, receiverCtrl.count);
  router.route('/receiver/:id').get(auth, receiverCtrl.get);
  router.route('/receiver').post(auth, receiverCtrl.createReceiver);
  router.route('/receiver/:id').put(auth, receiverCtrl.updateReceiver);
  router.route('/receiver/:id').delete(auth, receiverCtrl.delete);

  //Debt Reminder createDebtReminder
  router.route('/debtreminders').get(auth, debtReminderCtrl.getMyDebtReminders);
  router.route('/indebtedness').get(auth, debtReminderCtrl.getMyIndebtedness);
  router.route('/indebtedness/unpaid').get(auth, debtReminderCtrl.getMyIndebtednessUnpaid);
  router.route('/debtreminderPay/:id').post(auth, otp, debtReminderCtrl.debtReminderBank);
  router.route('/debtreminder').post(auth, debtReminderCtrl.createDebtReminder);
  router.route('/debtreminder/:id').put(auth, debtReminderCtrl.updateDebtReminder);
  router.route('/debtremindercancel/:id').put(auth, debtReminderCtrl.cancelDebtReminder);
  router.route('/debtreminder/:id').delete(auth, debtReminderCtrl.delete);

  // Transaction
  router.route('/transactions').get(authEmployee, transactionCtrl.getAll);
  router.route('/transaction/transfer/:paymentAccount').get(authEmployee, transactionCtrl.getTransactionTransferByPayNumber);
  router.route('/transaction/get/:paymentAccount').get(authEmployee, transactionCtrl.getTransactionGetByPayNumber);
  router.route('/transaction/debtreminder/:paymentAccount').get(authEmployee, transactionCtrl.getTransactionDebtReminderByPayNumber);
  router.route('/transactions/count').get(authEmployee, transactionCtrl.count);
  router.route('/mytransaction/transfer').get(auth, transactionCtrl.getMyTransactionMoneyTransfer);
  router.route('/mytransaction/get').get(auth, transactionCtrl.getMyTransactionMoneyGet);
  router.route('/mytransaction/debtreminder').get(auth, transactionCtrl.getMyTransactionDebtReminder);
  router.route('/externalTransaction').post(authEmployee, transactionCtrl.getTransactionExternal);
  router.route('/transaction/internal').post(auth, otp, transactionCtrl.internalBank);
  router.route('/transaction/external').post(auth, otp, transactionCtrl.externalBank); // External done but has not api from Partner
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
  router.route('/transaction/addmoney').post(authSK, transactionCtrl.addMoneyPartner);

  // Partner getRecipient
  router.route('/getInfoRecipient/:stk').get(auth, partnerCtrl.getRecipient);
  router.route('/testTransaction').post(partnerCtrl.transactionPartner);

  // Apply the routes to our application with the prefix /api
  app.use('/api', router);
};

export default setRoutes;
