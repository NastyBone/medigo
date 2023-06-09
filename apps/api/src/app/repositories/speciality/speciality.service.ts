import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Speciality } from './entities';
import {
  CreateSpecialityDto,
  ResponseSpecialityDto,
  UpdateSpecialityDto,
} from './dto';
import { DoctorService } from '../doctor/doctor.service';

@Injectable()
export class SpecialityService {
  constructor(
    @InjectRepository(Speciality)
    private repository: Repository<Speciality>,
    private doctorSevice: DoctorService
  ) { }

  async findAll(): Promise<ResponseSpecialityDto[]> {
    const data = await this.repository.find({
      where: {
        deleted: false,
      },
      order: {
        description: 'ASC',
      },
    });

    return data.map((item) => new ResponseSpecialityDto(item));
  }

  async findValid(id: number): Promise<Speciality> {
    const data = this.repository.findOne({
      where: {
        id,
        deleted: false,
      },
    });
    if (!data) {
      throw new NotFoundException('Especialidad no encontrada.');
    }
    return data;
  }

  async findOne(id: number): Promise<ResponseSpecialityDto> {
    const speciality = await this.findValid(id);
    return new ResponseSpecialityDto(speciality);
  }

  async insert(
    createSpecialityDto: CreateSpecialityDto
  ): Promise<ResponseSpecialityDto> {
    try {
      const speciality = this.repository.create({
        name: createSpecialityDto.name,
        description: createSpecialityDto.description,
      });
      return new ResponseSpecialityDto(await this.repository.save(speciality));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al registrar especialidad');
    }
  }
  async update(
    id: number,
    updateSpecialityDto: UpdateSpecialityDto
  ): Promise<ResponseSpecialityDto> {
    await this.findValid(id);
    try {
      const speciality = await this.repository.save({
        id,
        name: updateSpecialityDto.name,
        description: updateSpecialityDto.description,
      });
      return this.findOne(speciality.id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al modificar especialidad');
    }
  }

  async remove(id: number): Promise<ResponseSpecialityDto> {
    try {
      const speciality = await this.findValid(id);
      await this.doctorSevice.deleteBySpeciality(id)
      speciality.deleted = true;
      return new ResponseSpecialityDto(await this.repository.save(speciality));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar especialidad');
    }
  }
}
