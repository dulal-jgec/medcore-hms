 -- Appointment indexes
 
CREATE INDEX idx_appointments_hospital_date_active
ON appointments (hospital_id, appointment_date)
WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_doctor_date_active
ON appointments (doctor_id, appointment_date)
WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_hospital_doctor_active
ON appointments (hospital_id, doctor_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_appointments_hospital_patient_active
ON appointments (hospital_id, patient_id)
WHERE deleted_at IS NULL;


 -- Billing indexes
 
CREATE INDEX idx_bills_hospital_bill_date_active
ON bills (hospital_id, bill_date)
WHERE deleted_at IS NULL;

CREATE INDEX idx_bills_hospital_status_active
ON bills (hospital_id, status)
WHERE deleted_at IS NULL;


 -- Bill item indexes
 
CREATE INDEX idx_bill_items_bill_active
ON bill_items (bill_id)
WHERE deleted_at IS NULL;


 -- Prescription item indexes
 
CREATE INDEX idx_prescription_items_prescription_active
ON prescription_items (prescription_id)
WHERE deleted_at IS NULL;