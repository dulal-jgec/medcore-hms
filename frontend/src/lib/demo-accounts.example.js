// ─────────────────────────────────────────────────────────────
//  DEMO ACCOUNTS — TEMPLATE
//
//  Copy this file to `lib/demo-accounts.js` and fill in real
//  credentials. The real file is gitignored, so credentials
//  never reach GitHub.
//
//  Command:
//    cp lib/demo-accounts.example.js lib/demo-accounts.js
// ─────────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS = {
  superAdmin: {
    role: "Super Admin",
    email: "super.admin@medcore.com",
    password: "SuperAdmin@123",
  },

  hospitals: [
    {
      id: 1,
      name: "City General Hospital",
      accounts: [
        {
          role: "Hospital Admin",
          email: "admin@cityhospital.com",
          password: "Admin@123",
        },
        {
          role: "Doctor",
          email: "doctor@cityhospital.com",
          password: "Doctor@123",
        },
        {
          role: "Nurse",
          email: "nurse@cityhospital.com",
          password: "Nurse@123",
        },
        {
          role: "Accountant",
          email: "accounts@cityhospital.com",
          password: "Accounts@123",
        },
        {
          role: "Receptionist",
          email: "reception@cityhospital.com",
          password: "Reception@123",
        },
      ],
    },

    {
      id: 2,
      name: "Metro Multispeciality Hospital",
      accounts: [
        {
          role: "Hospital Admin",
          email: "admin@metrohospital.com",
          password: "Admin@456",
        },
        {
          role: "Doctor",
          email: "doctor@metrohospital.com",
          password: "Doctor@456",
        },
        {
          role: "Nurse",
          email: "nurse@metrohospital.com",
          password: "Nurse@456",
        },
        {
          role: "Accountant",
          email: "accounts@metrohospital.com",
          password: "Accounts@456",
        },
        {
          role: "Receptionist",
          email: "reception@metrohospital.com",
          password: "Reception@456",
        },
      ],
    },
  ],
};