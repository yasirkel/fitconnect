import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { TrainingsService } from '../../services/trainings';

@Component({
  selector: 'app-training-create',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './training-create.component.html',
})
export class TrainingCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private trainingsService = inject(TrainingsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  error: string | null = null;
  clubId!: string;

  form = this.fb.group({
    clubId: ['', Validators.required],
    title: ['', Validators.required],
    description: [''],
    startTime: ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    capacity: [10, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const clubId = this.route.snapshot.queryParamMap.get('clubId');

    if (!clubId) {
      this.error = 'No clubId provided';
      return;
    }

    this.clubId = clubId;
    this.form.patchValue({ clubId });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.trainingsService.createTraining(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/clubs', this.clubId]);
      },
      error: () => {
        this.error = 'Failed to create training';
      },
    });
  }
}
