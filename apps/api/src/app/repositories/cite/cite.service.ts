import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Cite } from './entities';
import { CreateCiteDto, ResponseCiteDto, UpdateCiteDto } from './dto';
import { CronService } from '../../cron/cron.service';
import { getMonthRange } from '@medigo/time-handler';

@Injectable()
export class CiteService {
  constructor(
    @InjectRepository(Cite)
    private repository: Repository<Cite>,
    private cronService: CronService
  ) {}

  async findAll(): Promise<ResponseCiteDto[]> {
    // this.testCronJob(); //TODO: Delete
    const data = await this.repository.find({
      where: {
        deleted: false,
      },
      order: {
        date: 'ASC',
      },
      relations: {
        patient: {
          user: true,
        },
        doctor: {
          speciality: true,
          user: true,
        },
      },
    });
    return data.map((item) => new ResponseCiteDto(item));
  }

  async findValid(id: number): Promise<Cite> {
    const data = this.repository.findOne({
      where: {
        id,
        deleted: false,
      },
      order: {
        date: 'ASC',
      },
      relations: {
        patient: {
          user: true,
        },
        doctor: {
          speciality: true,
          user: true,
        },
      },
    });
    if (!data) {
      throw new NotFoundException('Cita no encontrada.');
    }
    return data;
  }

  async findOne(id: number): Promise<ResponseCiteDto> {
    const cite = await this.findValid(id);
    return new ResponseCiteDto(cite);
  }
  async insert(createCiteDto: CreateCiteDto): Promise<ResponseCiteDto> {
    try {
      if (new Date(createCiteDto.date) < new Date(Date.now())) {
        console.log(new Date(createCiteDto.date));
        throw new BadRequestException('Fecha Invalida');
      }
      const cite = this.repository.create({
        subject: createCiteDto.subject,
        date: new Date(createCiteDto.date).toLocaleDateString('es-ES'),
        time: createCiteDto.time,
        patientConfirm: createCiteDto.patientConfirm,
        doctor: {
          id: createCiteDto.doctorId,
        },
        patient: {
          id: createCiteDto.patientId,
        },
      });

      //CRON
      this.cronService.setCronJob(cite);
      if (cite.patientConfirm) {
        this.cronService.startJob(cite.id);
      } else {
        this.cronService.pauseJob(cite.id);
      }

      const newCite = await this.repository.save(cite);
      return this.findOne(newCite.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al registrar cita');
    }
  }
  async update(
    id: number,
    updateCiteDto: UpdateCiteDto
  ): Promise<ResponseCiteDto> {
    await this.findValid(id);
    try {
      if (new Date(updateCiteDto.date).getDate() < Date.now()) {
        throw new BadRequestException('Fecha Invalida');
      }
      const cite = await this.repository.save({
        id,
        subject: updateCiteDto.subject,
        date: new Date(updateCiteDto.date).toLocaleDateString('es-ES'),
        time: updateCiteDto.time,
        patientConfirm: updateCiteDto.patientConfirm,
        doctor: {
          id: updateCiteDto.doctorId,
        },
        patient: {
          id: updateCiteDto.patientId,
        },
      });

      //CRON
      this.cronService.updateCronJob(cite);
      if (cite.patientConfirm) {
        this.cronService.startJob(cite.id);
      } else {
        this.cronService.pauseJob(cite.id);
      }

      return this.findOne(cite.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al modificar cita');
    }
  }
  async remove(id: number): Promise<ResponseCiteDto> {
    //CRON
    try {
      this.cronService.deleteCronJob('' + id);
    } catch (e) {
      console.log();
    }
    try {
      const cite = await this.findValid(id);
      cite.deleted = true;
      return new ResponseCiteDto(await this.repository.save(cite));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar cita');
    }
  }
  async findByPatient(id: number): Promise<ResponseCiteDto[]> {
    try {
      const cite = await this.repository.find({
        where: {
          patient: {
            id,
          },
          deleted: false,
        },
        order: {
          date: 'ASC',
        },
        relations: {
          patient: {
            user: true,
          },
          doctor: {
            speciality: true,
            user: true,
          },
        },
      });
      return cite.map((item) => new ResponseCiteDto(item));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al encontrar citas');
    }
  }

  async findByDoctor(id: number): Promise<ResponseCiteDto[]> {
    try {
      const cite = await this.repository.find({
        where: {
          doctor: {
            id,
          },
          deleted: false,
        },
        order: {
          date: 'ASC',
        },
        relations: {
          patient: {
            user: true,
          },
          doctor: {
            speciality: true,
            user: true,
          },
        },
      });
      return cite.map((item) => new ResponseCiteDto(item));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al encontrar citas');
    }
  }

  async findByDoctorAndDate(
    doctor_id: number,
    date: string
  ): Promise<ResponseCiteDto[]> {
    try {
      const cites = await this.repository.find({
        where: {
          deleted: false,
          date: date,
          doctor: {
            id: doctor_id,
          },
        },
        relations: {
          patient: {
            user: true,
          },

          doctor: {
            speciality: true,
            user: true,
          },
        },
      });
      return cites.map((cite) => new ResponseCiteDto(cite));
    } catch (e) {
      throw new InternalServerErrorException('Error al encontrar cita');
    }
  }

  async getData(): Promise<{ completed: number; notCompleted: number }> {
    const [presentMonth, prevMonth] = getMonthRange();
    const countCompleted = await this.repository.count({
      where: {
        deleted: false,
        patientConfirm: true,
        createdAt: Between(prevMonth, presentMonth),
      },
    });

    const countNotCompleted = await this.repository.count({
      where: {
        deleted: false,
        patientConfirm: false,
        createdAt: Between(prevMonth, presentMonth),
      },
    });
    return { completed: countCompleted, notCompleted: countNotCompleted };
  }

  async getDataByDoctor(
    id: number
  ): Promise<{ completed: number; notCompleted: number }> {
    const countCompleted = await this.repository.count({
      where: {
        deleted: false,
        patientConfirm: true,
        doctor: {
          id,
        },
      },
    });

    const countNotCompleted = await this.repository.count({
      where: {
        deleted: false,
        patientConfirm: false,
        doctor: {
          id,
        },
      },
    });
    return { completed: countCompleted, notCompleted: countNotCompleted };
  }

  async deleteByPatients(id: number): Promise<void | boolean> {
    const cites = await this.repository.find({
      where: {
        deleted: false,
        patient: {
          id,
        },
      },
    });

    if (cites.length) {
      this.cronService.deleteManyCronJobs(cites);
      cites.map((item) => (item.deleted = true));
      await this.repository.save(cites);
    }

    console.log('SOFT DELETION: CITES BY PATIENT');
    return true;
  }

  async deleteByDoctors(id: number): Promise<void | boolean> {
    const cites = await this.repository.find({
      where: {
        deleted: false,
        doctor: {
          id,
        },
      },
    });
    if (cites.length) {
      this.cronService.deleteManyCronJobs(cites);
      cites.map((item) => (item.deleted = true));
      await this.repository.save(cites);
    }
    console.log('SOFT DELETION: CITES BY DOCTOR');
    return true;
  }

  testCronJob(): string {
    this.cronService.test();
    return 'Send!';
  } //FIXME: Borrar
}
