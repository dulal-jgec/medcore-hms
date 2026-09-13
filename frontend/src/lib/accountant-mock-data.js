// Mock data — swap for API calls later
// GET /api/v1/accountants/me
// GET /api/v1/accountants/dashboard
// GET /api/v1/accountants/bills
// GET /api/v1/accountants/outstanding-bills

export const ACCOUNTANT_PROFILE = {
  id: 1,
  fullName: "Priya Banerjee",
  email: "priya.banerjee@medcore.health",
  phone: "+91 98300 11111",
  employeeId: "ACC-2024-001",
  hospitalName: "North Bengal Medical Centre",
  hospitalId: 1,
  department: "Finance & Accounts",
  qualification: "M.Com, CA (Inter)",
  joinedOn: "2024-01-10",
  status: "ACTIVE",
  gender: "Female",
};

/* ─── Dashboard summary ─── */
export const FINANCIAL_SUMMARY = {
  totalBills: 1284,
  totalBilledAmount: 12846000,      // ₹1.28 Cr
  totalPaidAmount: 9682000,         // ₹96.82 L
  totalOutstandingAmount: 3164000,  // ₹31.64 L
  outstandingBills: 184,
};

/* ─── Payment method breakdown ─── */
export const PAYMENT_METHODS = [
  { method: "UPI", transactions: 412, amount: 3846000, color: "brand" },
  { method: "Card", transactions: 298, amount: 4128000, color: "brand" },
  { method: "Cash", transactions: 156, amount: 1248000, color: "highlight" },
  { method: "Net Banking", transactions: 62, amount: 380000, color: "info" },
  { method: "Insurance", transactions: 18, amount: 84000, color: "muted" },
];

/* ─── All bills (paginated view) ─── */
export const ALL_ACCOUNTANT_BILLS = [
  { id: 5001, invoiceNo: "INV-2026-0201", patientName: "Arvind Kumar", patientId: 3, issuedOn: "2026-09-13", dueDate: "2026-09-27", amount: 18500, paid: 0, status: "PENDING", department: "Cardiology", items: 4, paymentMethod: null },
  { id: 5002, invoiceNo: "INV-2026-0200", patientName: "Sunita Devi", patientId: 2, issuedOn: "2026-09-13", dueDate: "2026-09-27", amount: 4200, paid: 0, status: "PENDING", department: "Cardiology", items: 2, paymentMethod: null },
  { id: 5003, invoiceNo: "INV-2026-0199", patientName: "Rohit Sharma", patientId: 1, issuedOn: "2026-09-12", dueDate: "2026-09-26", amount: 1240, paid: 1240, status: "PAID", department: "Cardiology", items: 2, paymentMethod: "UPI", paidOn: "2026-09-12" },
  { id: 5004, invoiceNo: "INV-2026-0198", patientName: "Meera Joshi", patientId: 4, issuedOn: "2026-09-12", dueDate: "2026-09-26", amount: 3200, paid: 3200, status: "PAID", department: "Cardiology", items: 3, paymentMethod: "CARD", paidOn: "2026-09-12" },
  { id: 5005, invoiceNo: "INV-2026-0197", patientName: "Lakshmi Rao", patientId: 6, issuedOn: "2026-09-11", dueDate: "2026-09-25", amount: 850, paid: 850, status: "PAID", department: "Neurology", items: 1, paymentMethod: "CASH", paidOn: "2026-09-11" },
  { id: 5006, invoiceNo: "INV-2026-0196", patientName: "Karan Mehta", patientId: 5, issuedOn: "2026-09-11", dueDate: "2026-09-25", amount: 12400, paid: 5000, status: "PARTIALLY_PAID", department: "Cardiology", items: 5, paymentMethod: "UPI", paidOn: "2026-09-11" },
  { id: 5007, invoiceNo: "INV-2026-0195", patientName: "Raj Kumar", patientId: 7, issuedOn: "2026-09-10", dueDate: "2026-09-24", amount: 650, paid: 650, status: "PAID", department: "General Medicine", items: 1, paymentMethod: "UPI", paidOn: "2026-09-10" },
  { id: 5008, invoiceNo: "INV-2026-0194", patientName: "Suresh Chandra", patientId: 9, issuedOn: "2026-09-10", dueDate: "2026-09-24", amount: 28600, paid: 10000, status: "PARTIALLY_PAID", department: "Neurology", items: 6, paymentMethod: "NET_BANKING", paidOn: "2026-09-10" },
  { id: 5009, invoiceNo: "INV-2026-0193", patientName: "Anita Bhandari", patientId: 8, issuedOn: "2026-09-09", dueDate: "2026-09-23", amount: 2200, paid: 2200, status: "PAID", department: "Pediatrics", items: 2, paymentMethod: "CARD", paidOn: "2026-09-09" },
  { id: 5010, invoiceNo: "INV-2026-0192", patientName: "Deepak Verma", patientId: 11, issuedOn: "2026-09-09", dueDate: "2026-09-23", amount: 3100, paid: 3100, status: "PAID", department: "Orthopedics", items: 2, paymentMethod: "UPI", paidOn: "2026-09-09" },
  { id: 5011, invoiceNo: "INV-2026-0191", patientName: "Kavita Sen", patientId: 12, issuedOn: "2026-09-08", dueDate: "2026-09-22", amount: 1800, paid: 1800, status: "PAID", department: "Pediatrics", items: 1, paymentMethod: "CASH", paidOn: "2026-09-08" },
  { id: 5012, invoiceNo: "INV-2026-0190", patientName: "Pooja Sharma", patientId: 10, issuedOn: "2026-09-08", dueDate: "2026-09-15", amount: 750, paid: 0, status: "PENDING", department: "General Medicine", items: 1, paymentMethod: null },
  { id: 5013, invoiceNo: "INV-2026-0189", patientName: "Anita Bhandari", patientId: 8, issuedOn: "2026-09-07", dueDate: "2026-09-21", amount: 4500, paid: 4500, status: "PAID", department: "Pediatrics", items: 3, paymentMethod: "INSURANCE", paidOn: "2026-09-07" },
  { id: 5014, invoiceNo: "INV-2026-0188", patientName: "Raj Kumar", patientId: 7, issuedOn: "2026-09-06", dueDate: "2026-09-20", amount: 890, paid: 0, status: "CANCELLED", department: "General Medicine", items: 1, paymentMethod: null },
  { id: 5015, invoiceNo: "INV-2026-0187", patientName: "Kavita Sen", patientId: 12, issuedOn: "2026-09-05", dueDate: "2026-09-19", amount: 5400, paid: 5400, status: "PAID", department: "Pediatrics", items: 3, paymentMethod: "CARD", paidOn: "2026-09-05" },
];

/* ─── Recent payments ─── */
export const RECENT_PAYMENTS = [
  { id: 1, invoiceNo: "INV-2026-0199", patientName: "Rohit Sharma", amount: 1240, method: "UPI", receivedOn: "2026-09-12 10:45 AM", receivedBy: "Priya Banerjee" },
  { id: 2, invoiceNo: "INV-2026-0198", patientName: "Meera Joshi", amount: 3200, method: "CARD", receivedOn: "2026-09-12 09:30 AM", receivedBy: "Priya Banerjee" },
  { id: 3, invoiceNo: "INV-2026-0197", patientName: "Lakshmi Rao", amount: 850, method: "CASH", receivedOn: "2026-09-11 04:15 PM", receivedBy: "Priya Banerjee" },
  { id: 4, invoiceNo: "INV-2026-0196", patientName: "Karan Mehta", amount: 5000, method: "UPI", receivedOn: "2026-09-11 11:20 AM", receivedBy: "Priya Banerjee" },
  { id: 5, invoiceNo: "INV-2026-0194", patientName: "Suresh Chandra", amount: 10000, method: "NET_BANKING", receivedOn: "2026-09-10 03:50 PM", receivedBy: "Priya Banerjee" },
];

/* ─── Monthly revenue trend (6 months) ─── */
export const MONTHLY_REVENUE = [
  { month: "Apr", billed: 2180000, collected: 1640000 },
  { month: "May", billed: 2340000, collected: 1890000 },
  { month: "Jun", billed: 2090000, collected: 1720000 },
  { month: "Jul", billed: 2480000, collected: 1980000 },
  { month: "Aug", billed: 2720000, collected: 2150000 },
  { month: "Sep", billed: 1030000, collected: 302000 },  // partial month
];

export function getOutstandingBills() {
  return ALL_ACCOUNTANT_BILLS.filter(
    (b) => b.status === "PENDING" || b.status === "PARTIALLY_PAID"
  );
}

export function getAccountantStats() {
  return {
    totalBills: FINANCIAL_SUMMARY.totalBills,
    totalBilled: FINANCIAL_SUMMARY.totalBilledAmount,
    totalCollected: FINANCIAL_SUMMARY.totalPaidAmount,
    totalOutstanding: FINANCIAL_SUMMARY.totalOutstandingAmount,
    outstandingCount: FINANCIAL_SUMMARY.outstandingBills,
    collectionRate: Math.round(
      (FINANCIAL_SUMMARY.totalPaidAmount /
        FINANCIAL_SUMMARY.totalBilledAmount) *
        100
    ),
  };
}