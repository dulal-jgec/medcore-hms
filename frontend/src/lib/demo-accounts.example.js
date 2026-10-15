// ─────────────────────────────────────────────────────────────
//  DEMO ACCOUNTS
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

const MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function isDemoModeEnabled() {
  return MODE && getDemoAccounts().length > 0;
}

export function getDemoAccounts() {
  if (!MODE) return [];

  const list = [];

  // Super Admin → Platform group (empty note)
  if (
    DEMO_ACCOUNTS.superAdmin?.email &&
    DEMO_ACCOUNTS.superAdmin?.password
  ) {
    list.push({
      role: DEMO_ACCOUNTS.superAdmin.role || "Super Admin",
      email: DEMO_ACCOUNTS.superAdmin.email.trim(),
      password: DEMO_ACCOUNTS.superAdmin.password,
      note: "",
    });
  }

  // Hospital accounts → grouped by hospital name
  if (Array.isArray(DEMO_ACCOUNTS.hospitals)) {
    for (const hospital of DEMO_ACCOUNTS.hospitals) {
      if (!hospital?.name || !Array.isArray(hospital.accounts)) continue;

      for (const acc of hospital.accounts) {
        if (
          acc &&
          typeof acc.email === "string" &&
          typeof acc.password === "string" &&
          acc.email.length > 0 &&
          acc.password.length > 0
        ) {
          list.push({
            role: typeof acc.role === "string" ? acc.role : "Demo",
            email: acc.email.trim(),
            password: acc.password,
            note: hospital.name,
          });
        }
      }
    }
  }

  return list;
}