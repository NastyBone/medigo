import { Injectable } from '@angular/core';
import { CreateCiteService } from './use-cases/create-cite/create-cite.service';
import { DeleteCiteService } from './use-cases/delete-cite/delete-cite.service';
import { FindCiteService } from './use-cases/find-cite/find-cite.service';
import { GetCitesService } from './use-cases/get-cites/get-cites.service';
import { UpdateCiteService } from './use-cases/update-cite/update-cite.service';
import { CiteMemoryService } from './memory';
import { ListComponentService } from '../../common/memory-repository/list-component.service';
import { CiteItemVM } from './model';
import { FindCitesByDoctorService } from './use-cases/find-cites-by-doctor/find-cites-by-doctor.service';
import { FindCitesByPatientService } from './use-cases/find-cites-by-patient/find-cites-by-patient.service';
import { Observable, finalize } from 'rxjs';

@Injectable()
export class CiteService extends ListComponentService<CiteItemVM> {
  constructor(
    public createCiteService: CreateCiteService,
    public deleteCiteService: DeleteCiteService,
    public findCiteService: FindCiteService,
    public getCitesService: GetCitesService,
    public updateCiteService: UpdateCiteService,
    public citesMemoryService: CiteMemoryService,
    protected findCiteByDoctor: FindCitesByDoctorService,
    protected findCiteByPatient: FindCitesByPatientService
  ) {
    super(
      getCitesService,
      citesMemoryService,
      deleteCiteService,
      createCiteService,
      updateCiteService,
      findCiteService
    );
  }

  findByDoctorId$(id: number): Observable<Array<CiteItemVM>> {
    this.setLoading(true);
    return this.findCiteByDoctor
      .exec({ id })
      .pipe(finalize(() => this.setLoading(false)));
  }

  findByPatient$(id: number): Observable<Array<CiteItemVM>> {
    this.setLoading(true);
    return this.findCiteByPatient
      .exec({ id })
      .pipe(finalize(() => this.setLoading(false)));
  }
}