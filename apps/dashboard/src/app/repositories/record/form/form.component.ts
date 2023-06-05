import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isEqual } from 'lodash';
import { Subscription, finalize } from 'rxjs';
import { StateService } from '../../../common/state';
import { RecordVM } from '../model';
import { RecordService } from '../record.service';

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
  oldRecordValue: RecordVM = {
    date: '',
    description: '',
    doctorId: 0,
    patientId: 0,
  };

  form!: FormGroup;
  loading = false;

  constructor(
    private recordService: RecordService,
    @Inject(MAT_DIALOG_DATA) public data: RecordVM,
    private stateService: StateService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.stateService.setLoading(this.loading);
    this.createForm();
    if (this.data?.id) {
      this.sub$.add(
        this.recordService
          .find$({ id: this.data.id })
          .pipe(
            finalize(() => {
              this.loading = false;
              this.stateService.setLoading(this.loading);
            })
          )
          .subscribe((record) => {
            if (record) {
              this.oldRecordValue = record;
              this.form.patchValue(
                {
                  ...record,
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
    this.closed.emit();
  }
  private createForm(): void {
    this.form = this.formBuilder.group({
      //TODO: Fix
    });
    this.sub$.add(
      this.form.valueChanges.subscribe(() => {
        this.submitDisabled =
          isEqual(this.oldRecordValue, this.form.getRawValue()) ||
          this.form.invalid;
      })
    );
  }

  clickSave(): void {
    if (this.data.id) {
      this.update();
    } else {
      this.create();
    }
  }
  private create(): void {
    if (!this.submitDisabled) {
      this.sub$.add(
        this.recordService
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
        this.recordService
          .update({
            ...this.form.value,
            id: this.data.id,
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
}
