import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Doctor } from './entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDoctorDto, ResponseDoctorDto, UpdateDoctorDto } from './dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private repository: Repository<Doctor>
  ) {}

  async findAll(): Promise<ResponseDoctorDto[]> {
    const data = await this.repository.find({
      where: {
        deleted: false,
      },
      order: {
        user: {
          lastName: 'ASC',
        },
      },
      relations: {
        user: true,
        speciality: true,
      },
    });

    return data.map((item) => new ResponseDoctorDto(item));
  }

  async findValid(id: number): Promise<Doctor> {
    const data = this.repository.findOne({
      where: {
        id,
        deleted: false,
      },
      relations: {
        user: true,
        speciality: true,
      },
    });
    if (!data) {
      throw new NotFoundException('Doctor no encontrado.');
    }
    return data;
  }

  async findOne(id: number): Promise<ResponseDoctorDto> {
    const doctor = await this.findValid(id);
    return new ResponseDoctorDto(doctor);
  }
  async insert(createDoctorDto: CreateDoctorDto): Promise<ResponseDoctorDto> {
    const user = await this.findByUserId(createDoctorDto.userId);
    if (user) {
      throw new BadRequestException(
        'Este usuario ya está asignado como doctor'
      );
    }
    try {
      const doctor = this.repository.create({
        phone: createDoctorDto.phone,
        speciality: {
          id: createDoctorDto.specialityId,
        },
        user: {
          id: createDoctorDto.userId,
        },
      });
      return new ResponseDoctorDto(await this.repository.save(doctor));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al registrar doctor');
    }
  }
  async update(
    id: number,
    updateDoctorDto: UpdateDoctorDto
  ): Promise<ResponseDoctorDto> {
    await this.findValid(id);
    try {
      const doctor = await this.repository.save({
        id,
        phone: updateDoctorDto.phone,
        speciality: {
          id: updateDoctorDto.specialityId,
        },
        user: {
          id: updateDoctorDto.userId,
        },
      });
      return this.findOne(doctor.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al modificar doctor');
    }
  }
  async remove(id: number): Promise<ResponseDoctorDto> {
    try {
      const doctor = await this.findValid(id);
      doctor.deleted = true;
      return new ResponseDoctorDto(await this.repository.save(doctor));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar doctor');
    }
  }
  async findByUserId(id: number): Promise<ResponseDoctorDto> {
    try {
      const doctor = await this.repository.findOne({
        where: {
          user: {
            id,
          },
          deleted: false,
        },
        relations: {
          user: true,
          speciality: true,
        },
      });
      return new ResponseDoctorDto(doctor);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al encontrar asistante');
    }
  }
  async findBySpeciality(specialityId: number): Promise<ResponseDoctorDto[]> {
    const doctorsBySpeciality = this.repository.find({
      where: {
        speciality: {
          id: specialityId,
        },
        deleted: false,
      },
      relations: {
        user: true,
        speciality: true,
      },
    });

    return doctorsBySpeciality;
  }
}
