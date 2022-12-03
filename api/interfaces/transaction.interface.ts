export interface Transaction {
  id: string;
  userId: string;
  receiverId: string;
  receivingBankId: string;
  amountOwed: number;
  transactionFee: number;
  description: string;
  status: string; // transferring: Đang chuyển tiền; completed: Chuyển tiền thành công; failed: Chuyển thất bại; not_yet_delivered: Chưa giao tiền; delivered: Đã giao tiền
  typeTransaction: string // internal: Trong ngân hàng; external: Ngoài ngân hàng
  createTime: number;
  updateTime: number;
};