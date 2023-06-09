import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IdEntity } from '../../base';
import { Doctor } from '../../doctor/entities';
import { Patient } from '../../patient/entities';
import { Availability } from '../../availability/entities';

@Entity()
export class Cite extends IdEntity {
  @Column({ length: 800, nullable: false })
  subject!: string;

  @Column({ length: 256, nullable: false })
  date!: string;

  @Column({ nullable: false })
  patientConfirm!: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.id, { nullable: false })
  @JoinColumn()
  doctor!: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.id, { nullable: false })
  @JoinColumn()
  patient!: Patient;

  @ManyToOne(() => Availability, (availability) => availability.id, {
    nullable: false,
  })
  time!: Availability;
}
