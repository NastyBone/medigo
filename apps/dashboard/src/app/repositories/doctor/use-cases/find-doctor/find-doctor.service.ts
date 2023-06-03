import { Injectable } from '@angular/core';
import { DoctorService } from '@medigo/dashboard-sdk';
import { UseCase, BaseQuery } from '../../../../common';
import { Observable, map } from 'rxjs';
import { Doctor2DoctorVM } from '../../mappers';
import { DoctorVM } from '../../model';

@Injectable()
export class FindDoctorService implements UseCase<DoctorVM | null, BaseQuery> {
  constructor(private doctorService: DoctorService) {}

  exec(data: BaseQuery): Observable<DoctorVM | null> {
    return this.doctorService
      .doctorControllerFindOne(data?.id || 0) //ERROR
      .pipe(map(Doctor2DoctorVM));
  }
}
