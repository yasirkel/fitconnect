import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';

import { TrainingsService } from '../../services/trainings.service';

@Component({
  selector: 'app-training-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './training-edit.component.html',
})
export class TrainingEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private trainingsService = inject(TrainingsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  trainingId!: string;
  clubId!: string;
  loading = true;
  error: string | null = null;
  deleting = false;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    startTime: ['', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(1)]],
    capacity: [10, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No training id';
      return;
    }

    this.trainingId = id;

    this.trainingsService.getOne(id).subscribe({
      next: (t) => {
        this.clubId = t.clubId;
        this.form.patchValue({
          title: t.title,
          description: t.description,
          startTime: t.startTime,
          durationMinutes: t.durationMinutes,
          capacity: t.capacity,
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load training';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.trainingsService.update(this.trainingId, this.form.value).subscribe({
      next: () => this.router.navigate(['/clubs', this.clubId]),
      error: () => (this.error = 'Failed to update training'),
    });
  }

  delete(): void {
    const confirmed = window.confirm('Delete this training?');
    if (!confirmed) return;

    this.deleting = true;

    this.trainingsService.delete(this.trainingId).subscribe({
      next: () => this.router.navigate(['/clubs', this.clubId]),
      error: () => {
        this.error = 'Failed to delete training';
        this.deleting = false;
      },
    });
  }
}
