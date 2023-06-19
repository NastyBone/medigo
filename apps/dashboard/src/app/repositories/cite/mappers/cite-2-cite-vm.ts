/* eslint-disable @typescript-eslint/no-explicit-any */
import { CiteVM } from '../model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Cite2CiteVM(Cite: any): CiteVM {
  return {
    id: Cite.id,
    subject: Cite.subject,
    date: Cite.date,
    time: Cite.time,
    patientConfirm: Cite.patientConfirm == 'Confirmada' ? true : false,
    doctorId: Cite.doctor.id,
    patientId: Cite.patient.id,
  };
}
