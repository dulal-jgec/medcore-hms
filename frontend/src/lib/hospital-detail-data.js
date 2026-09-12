// Mock data — swap for API calls later
// GET /api/hospitals/:id/departments
// GET /api/hospitals/:id/doctors

export const DEPARTMENTS = [
  {
    id: "cardiology",
    name: "Cardiology",
    description:
      "Comprehensive heart care including diagnostics, interventional procedures, and cardiac rehabilitation.",
    beds: 42,
    doctors: 12,
    floor: "3rd Floor, Block A",
    image: "/images/departments-default.jpg",
  },
  {
    id: "neurology",
    name: "Neurology",
    description:
      "Diagnosis and treatment of disorders of the nervous system including brain, spine, and nerves.",
    beds: 28,
    doctors: 8,
    floor: "4th Floor, Block A",
    image: "/images/departments-default.jpg",
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    description:
      "Bone, joint, and musculoskeletal care including joint replacement and sports injuries.",
    beds: 36,
    doctors: 10,
    floor: "2nd Floor, Block B",
    image: "/images/departments-default.jpg",
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    description:
      "Specialized healthcare for infants, children, and adolescents including NICU support.",
    beds: 30,
    doctors: 9,
    floor: "5th Floor, Block B",
    image: "/images/departments-default.jpg",
  },
  {
    id: "ophthalmology",
    name: "Ophthalmology",
    description:
      "Complete eye care including cataract, retina, cornea, and LASIK procedures.",
    beds: 18,
    doctors: 6,
    floor: "1st Floor, Block C",
    image: "/images/departments-default.jpg",
  },
  {
    id: "general-medicine",
    name: "General Medicine",
    description:
      "Primary care, diagnosis, and management of acute and chronic medical conditions.",
    beds: 60,
    doctors: 18,
    floor: "Ground Floor, Block A",
    image: "/images/departments-default.jpg",
  },
  {
    id: "pathology",
    name: "Pathology",
    description:
      "Laboratory diagnostics including hematology, biochemistry, microbiology, and histopathology.",
    beds: 0,
    doctors: 5,
    floor: "Basement, Block A",
    image: "/images/departments-default.jpg",
  },
  {
    id: "emergency",
    name: "Emergency",
    description:
      "24/7 emergency and trauma care with dedicated resuscitation and observation bays.",
    beds: 24,
    doctors: 14,
    floor: "Ground Floor, Block A",
    image: "/images/departments-default.jpg",
  },
];

export const DOCTORS = [
  {
    id: "ananya-sharma",
    name: "Dr. Ananya Sharma",
    specialty: "Cardiologist",
    departmentId: "cardiology",
    experience: "12 years",
    education: "MBBS, MD (Cardiology) — AIIMS Delhi",
    languages: ["English", "Hindi", "Bengali"],
    bio: "Dr. Sharma specializes in interventional cardiology with over 1,200 successful angioplasty procedures. She leads the Cath Lab at MedCore and has published extensively on preventive cardiology.",
    availability: "Mon, Wed, Fri · 10:00 AM – 2:00 PM",
    image: "/images/doctors-default.jpg",
  },
  {
    id: "rajesh-verma",
    name: "Dr. Rajesh Verma",
    specialty: "Neurologist",
    departmentId: "neurology",
    experience: "15 years",
    education: "MBBS, DM (Neurology) — NIMHANS Bangalore",
    languages: ["English", "Hindi"],
    bio: "Dr. Verma is a senior neurologist with expertise in stroke management, epilepsy, and movement disorders. He has pioneered telemedicine stroke protocols in the region.",
    availability: "Tue, Thu, Sat · 11:00 AM – 3:00 PM",
    image: "/images/doctors-default.jpg",
  },
  {
    id: "priya-iyer",
    name: "Dr. Priya Iyer",
    specialty: "Pediatrician",
    departmentId: "pediatrics",
    experience: "9 years",
    education: "MBBS, MD (Pediatrics) — CMC Vellore",
    languages: ["English", "Tamil", "Hindi"],
    bio: "Dr. Iyer focuses on newborn and child healthcare, with a special interest in pediatric nutrition and developmental pediatrics.",
    availability: "Mon–Fri · 9:00 AM – 12:00 PM",
    image: "/images/doctors-default.jpg",
  },
  {
    id: "vikram-singh",
    name: "Dr. Vikram Singh",
    specialty: "Orthopedic Surgeon",
    departmentId: "orthopedics",
    experience: "18 years",
    education: "MBBS, MS (Ortho) — PGI Chandigarh",
    languages: ["English", "Hindi", "Punjabi"],
    bio: "Dr. Singh is a joint replacement specialist with over 3,000 successful knee and hip replacement surgeries. He is a visiting faculty at two national orthopedic conferences.",
    availability: "Mon, Tue, Thu · 2:00 PM – 6:00 PM",
    image: "/images/doctors-default.jpg",
  },
  {
    id: "meera-nair",
    name: "Dr. Meera Nair",
    specialty: "General Physician",
    departmentId: "general-medicine",
    experience: "11 years",
    education: "MBBS, MD (Internal Medicine) — JIPMER",
    languages: ["English", "Malayalam", "Hindi"],
    bio: "Dr. Nair manages chronic conditions including diabetes, hypertension, and thyroid disorders. She emphasizes preventive care and patient education.",
    availability: "Mon–Sat · 9:00 AM – 1:00 PM",
    image: "/images/doctors-default.jpg",
  },
  {
    id: "arjun-das",
    name: "Dr. Arjun Das",
    specialty: "Emergency Medicine",
    departmentId: "emergency",
    experience: "7 years",
    education: "MBBS, MD (Emergency Medicine) — AIIMS Delhi",
    languages: ["English", "Hindi", "Bengali"],
    bio: "Dr. Das leads the emergency response team and specializes in trauma care, critical care management, and pre-hospital emergency medicine.",
    availability: "On rotational shifts — 24/7 emergency",
    image: "/images/doctors-default.jpg",
  },
];

export function getHospitalDepartments() {
  return DEPARTMENTS;
}

export function getHospitalDoctors() {
  return DOCTORS;
}

export function getDepartmentById(id) {
  return DEPARTMENTS.find((d) => d.id === id) || null;
}

export function getDoctorById(id) {
  return DOCTORS.find((d) => d.id === id) || null;
}