// Mock data — swap for API calls later
// GET /api/v1/patients/:id
// GET /api/v1/appointments?patientId=:id
// GET /api/v1/prescriptions?patientId=:id
// GET /api/v1/lab-reports?patientId=:id
// GET /api/v1/bills?patientId=:id

export const PATIENT = {
  id: 1,
  fullName: "Rohit Sharma",
  email: "rohit.sharma@example.com",
  phone: "+91 98765 43210",
  dateOfBirth: "1990-04-12",
  age: 34,
  gender: "Male",
  bloodGroup: "O+",
  hospitalName: "North Bengal Medical Centre",
  hospitalId: 1,
  address: "Siliguri, West Bengal",
  city: "Siliguri",
  state: "West Bengal",
  pincode: "734001",
  maritalStatus: "Married",
  occupation: "Software Engineer",
  allergies: ["Penicillin", "Dust"],
  chronicConditions: ["Hypertension", "Type 2 Diabetes"],
  emergencyContact: {
    name: "Priya Sharma",
    relation: "Spouse",
    phone: "+91 98765 11111",
    email: "priya.sharma@example.com",
  },
  registeredOn: "2024-06-15",
};

export const UPCOMING_APPOINTMENTS = [
  {
    id: 101,
    doctorName: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    department: "Cardiology",
    date: "2026-09-18",
    time: "10:30 AM",
    status: "confirmed",
    reason: "Routine cardiac checkup",
  },
  {
    id: 102,
    doctorName: "Dr. Meera Nair",
    specialty: "General Physician",
    department: "General Medicine",
    date: "2026-09-25",
    time: "11:00 AM",
    status: "pending",
    reason: "Follow-up — diabetes review",
  },
];

export const PAST_APPOINTMENTS = [
  {
    id: 90,
    doctorName: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    date: "2026-08-15",
    time: "10:00 AM",
    status: "completed",
  },
  {
    id: 89,
    doctorName: "Dr. Arjun Das",
    specialty: "Emergency Medicine",
    date: "2026-07-22",
    time: "08:45 PM",
    status: "completed",
  },
  {
    id: 88,
    doctorName: "Dr. Vikram Singh",
    specialty: "Orthopedic Surgeon",
    date: "2026-06-10",
    time: "03:00 PM",
    status: "completed",
  },
];

export const CANCELLED_APPOINTMENTS = [
  {
    id: 85,
    doctorName: "Dr. Priya Iyer",
    specialty: "Pediatrician",
    department: "Pediatrics",
    date: "2026-05-20",
    time: "11:30 AM",
    status: "cancelled",
    reason: "Rescheduled by patient",
    cancelledOn: "2026-05-18",
  },
];

export const PRESCRIPTIONS = [
  {
    id: 201,
    doctorName: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    issuedOn: "2026-08-15",
    diagnosis: "Hypertension — stable",
    notes: "Continue medication. Reduce salt intake. Follow up in 4 weeks.",
    medicines: [
      {
        name: "Amlodipine 5mg",
        dosage: "Once daily",
        duration: "30 days",
        timing: "After breakfast",
      },
      {
        name: "Aspirin 75mg",
        dosage: "Once daily",
        duration: "30 days",
        timing: "After dinner",
      },
    ],
    status: "active",
  },
  {
    id: 202,
    doctorName: "Dr. Meera Nair",
    specialty: "General Physician",
    issuedOn: "2026-07-05",
    diagnosis: "Type 2 Diabetes",
    notes: "Monitor blood sugar weekly. Diet control. Next HbA1c in 3 months.",
    medicines: [
      {
        name: "Metformin 500mg",
        dosage: "Twice daily",
        duration: "60 days",
        timing: "After meals",
      },
    ],
    status: "active",
  },
  {
    id: 203,
    doctorName: "Dr. Arjun Das",
    specialty: "Emergency Medicine",
    issuedOn: "2026-07-22",
    diagnosis: "Acute ankle sprain",
    notes: "Rest, ice, elevation. Physiotherapy if pain persists.",
    medicines: [
      {
        name: "Ibuprofen 400mg",
        dosage: "As needed",
        duration: "5 days",
        timing: "After food",
      },
      {
        name: "Diclofenac gel",
        dosage: "Apply twice daily",
        duration: "7 days",
        timing: "Morning & night",
      },
    ],
    status: "completed",
  },
  {
    id: 204,
    doctorName: "Dr. Priya Iyer",
    specialty: "Pediatrician",
    issuedOn: "2026-04-10",
    diagnosis: "Seasonal allergy",
    notes: "Avoid dust. Antihistamine course complete.",
    medicines: [
      {
        name: "Cetirizine 10mg",
        dosage: "Once daily",
        duration: "14 days",
        timing: "Before bed",
      },
    ],
    status: "completed",
  },
];

export const LAB_REPORTS = [
  {
    id: 301,
    testName: "Complete Blood Count (CBC)",
    orderedBy: "Dr. Meera Nair",
    date: "2026-09-01",
    status: "ready",
    summary: "All parameters within normal range",
    values: [
      { name: "Hemoglobin", value: "14.2", unit: "g/dL", range: "13.0 – 17.0", status: "normal" },
      { name: "WBC Count", value: "7,200", unit: "/µL", range: "4,000 – 11,000", status: "normal" },
      { name: "Platelet Count", value: "245,000", unit: "/µL", range: "150,000 – 450,000", status: "normal" },
      { name: "RBC Count", value: "5.1", unit: "million/µL", range: "4.5 – 5.9", status: "normal" },
    ],
  },
  {
    id: 302,
    testName: "Lipid Profile",
    orderedBy: "Dr. Ananya Sharma",
    date: "2026-08-15",
    status: "ready",
    summary: "LDL slightly elevated — 142 mg/dL",
    values: [
      { name: "Total Cholesterol", value: "198", unit: "mg/dL", range: "< 200", status: "normal" },
      { name: "LDL Cholesterol", value: "142", unit: "mg/dL", range: "< 100", status: "high" },
      { name: "HDL Cholesterol", value: "48", unit: "mg/dL", range: "> 40", status: "normal" },
      { name: "Triglycerides", value: "135", unit: "mg/dL", range: "< 150", status: "normal" },
    ],
  },
  {
    id: 303,
    testName: "HbA1c",
    orderedBy: "Dr. Meera Nair",
    date: "2026-09-05",
    status: "in_progress",
    summary: "Sample collected — results expected in 24 hours",
    values: [],
  },
  {
    id: 304,
    testName: "Thyroid Function Test",
    orderedBy: "Dr. Meera Nair",
    date: "2026-09-08",
    status: "in_progress",
    summary: "Sample collected — awaiting lab processing",
    values: [],
  },
];

export const BILLS = [
  {
    id: 401,
    invoiceNo: "INV-2026-0182",
    issuedOn: "2026-09-01",
    dueDate: "2026-09-20",
    amount: 1240,
    tax: 0,
    total: 1240,
    status: "pending",
    description: "Lab tests — CBC + Lipid profile",
    items: [
      { name: "Complete Blood Count (CBC)", amount: 450 },
      { name: "Lipid Profile", amount: 790 },
    ],
  },
  {
    id: 402,
    invoiceNo: "INV-2026-0165",
    issuedOn: "2026-08-15",
    paidOn: "2026-08-15",
    amount: 850,
    tax: 0,
    total: 850,
    status: "paid",
    description: "Cardiology consultation",
    paymentMethod: "UPI",
    items: [{ name: "Cardiology OPD consultation", amount: 850 }],
  },
  {
    id: 403,
    invoiceNo: "INV-2026-0142",
    issuedOn: "2026-07-22",
    paidOn: "2026-07-22",
    amount: 3200,
    tax: 0,
    total: 3200,
    status: "paid",
    description: "Emergency visit + X-ray",
    paymentMethod: "Card",
    items: [
      { name: "Emergency consultation", amount: 1500 },
      { name: "X-ray (ankle)", amount: 1200 },
      { name: "Dressing & bandage", amount: 500 },
    ],
  },
];

export const PATIENT_VITALS = {
  bloodPressure: { value: "122/80", unit: "mmHg", status: "normal" },
  bloodSugar: { value: "138", unit: "mg/dL", status: "warning" },
  weight: { value: "78", unit: "kg", status: "normal" },
  heartRate: { value: "72", unit: "bpm", status: "normal" },
  lastUpdated: "2026-09-08",
};

export function getPatientStats() {
  const upcoming = UPCOMING_APPOINTMENTS.length;
  const activePrescriptions = PRESCRIPTIONS.filter(
    (p) => p.status === "active"
  ).length;
  const newReports = LAB_REPORTS.filter((r) => r.status === "ready").length;
  const pendingBills = BILLS.filter((b) => b.status === "pending");
  const pendingAmount = pendingBills.reduce((s, b) => s + b.amount, 0);

  return {
    upcoming,
    activePrescriptions,
    newReports,
    pendingBills: pendingBills.length,
    pendingAmount,
  };
}