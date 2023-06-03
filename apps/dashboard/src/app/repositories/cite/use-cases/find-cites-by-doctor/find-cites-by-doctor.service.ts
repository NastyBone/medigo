import { Injectable } from '@angular/core';
import { CiteService } from '@medigo/dashboard-sdk';
import { BaseQuery } from '../../../../common';
import { Observable, map } from 'rxjs';
import { Cite2CiteVM } from '../../mappers';
import { CiteVM } from '../../model';

@Injectable()
export class FindCitesByDoctorService {
  constructor(private citeService: CiteService) {}

  exec(data: BaseQuery): Observable<CiteVM | null> {
    return this.citeService
      .citeControllerFindOne(data?.id || 0) //ERROR
      .pipe(map(Cite2CiteVM));
  }
}
