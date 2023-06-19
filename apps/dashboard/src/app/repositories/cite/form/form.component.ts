import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

import { isEqual } from 'lodash';
import { Subscription, finalize, Observable } from 'rxjs';
import { StateService } from '../../../common/state';
import { CiteService } from '../cite.service';
import { CiteItemVM } from '../model';
import { ActivatedRoute, Router } from '@angular/router';

import { SpecialityItemVM } from '../../speciality/model';
import { DoctorItemVM } from '../../doctor/model';

@Component({
  selector: 'medigo-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
  @Output()
  closed = new EventEmitter();
  id?: number;
  submitDisabled = true;
  sub$ = new Subscription();
  oldCiteValue: CiteItemVM = {
    subject: '',
    date: '',
    time: '',
    patientConfirm: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doctorId: null as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patientId: null as any,
  };
  maxDate = new Date(2100, 11, 31);
  minDate = new Date(2000, 0, 1);

  form!: FormGroup;
  loading = false;
  filteredSpeciality!: Observable<SpecialityItemVM[]>;
  filteredDoctors!: Observable<DoctorItemVM[]>;
  dateControl = new FormControl([Validators.required]);
  constructor(
    private citeService: CiteService,

    private stateService: StateService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.stateService.setLoading(this.loading);
    this.createForm();
    if (this.activatedRoute.snapshot.params['id']) {
      this.id = this.activatedRoute.snapshot.params['id'];
    }
    if (this.id) {
      this.sub$.add(
        this.citeService
          .find$({ id: this.id })
          .pipe(
            finalize(() => {
              this.loading = false;
              this.stateService.setLoading(this.loading);
            })
          )
          .subscribe((cite) => {
            if (cite) {
              this.oldCiteValue = cite;
              this.form.patchValue(
                {
                  ...cite,
                },
                {
                  emitEvent: false,
                }
              );
            }
          })
      );
    }
    this.loading = false;
    this.stateService.setLoading(this.loading);
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }

  clickClosed(): void {
    this.router.navigate(['/dashboard/cite']);
  }
  private createForm(): void {
    this.form = this.formBuilder.group({
      subject: [null, [Validators.required, Validators.maxLength(256)]],
      date: [null, [Validators.required]], //TODO: Implementar DateControl
      time: [null, [Validators.required]],
      patientConfirm: [false, [Validators.required]],
      doctor: [null, [Validators.required]], //TODO: Implementar DoctorControl
      patient: [null, [Validators.required]], // TODO: Implementar PatientControl
    });
    this.sub$.add(
      this.form.valueChanges.subscribe(() => {
        this.submitDisabled =
          isEqual(this.oldCiteValue, this.form.getRawValue()) ||
          this.form.invalid;
      })
    );
  }

  clickSave(): void {
    this.form.value.patientConfirm == 'true' ||
    this.form.value.patientConfirm == true
      ? (this.form.value.patientConfirm = true)
      : (this.form.value.patientConfirm = false);
    if (this.id) {
      this.update();
    } else {
      this.create();
    }
  }
  private create(): void {
    if (!this.submitDisabled) {
      this.sub$.add(
        this.citeService
          .create({
            ...this.form.value,
          })
          .pipe(
            finalize(() => {
              this.form.reset();
              this.clickClosed();
            })
          )
          .subscribe()
      );
    }
  }

  private update(): void {
    if (!this.submitDisabled) {
      this.sub$.add(
        this.citeService
          .update({
            ...this.form.value,
            id: this.id,
          })
          .pipe(
            finalize(() => {
              this.form.reset();
              this.clickClosed();
            })
          )
          .subscribe()
      );
    }
  }
  displayFn(item?: any): string {
    if (item) {
      if (item.name) return item.name;
      if (item.firstName) return item.firstName + ' ' + item.lastName;
      if (item.vehicle) return item.vehicle.brand + ' ' + item.vehicle.model;
    }
    return '';
  }
}
