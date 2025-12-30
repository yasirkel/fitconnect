import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, DatePipe, AsyncPipe } from '@angular/common';

import { TrainingsService } from '../../services/trainings.service';
import { Training } from '@fitconnect/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-training-detail',
  standalone: true,
  imports: [NgIf, RouterLink, DatePipe, AsyncPipe],
  templateUrl: './training-detail.component.html',
})
export class TrainingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private trainingsService = inject(TrainingsService);
  private router = inject(Router);

  training: Training | null = null;
  loading = true;
  error: string | null = null;
  deleting = false;
  private authService = inject(AuthService);
  loggedIn$ = this.authService.loggedIn$;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No training id provided';
      this.loading = false;
      return;
    }

    this.trainingsService.getOne(id).subscribe({
      next: (t) => {
        this.training = t;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load training';
        this.loading = false;
      },
    });
  }

  onDelete(): void {
    if (!this.training) return;
    const confirmed = window.confirm(`Delete "${this.training.title}"?`);
    if (!confirmed) return;

    this.deleting = true;
    this.trainingsService.delete(this.training.id).subscribe({
      next: () => this.router.navigate(['/clubs', this.training?.clubId]),
      error: (err) => {
        const status = err?.status;
        const backendMessage = err?.error?.message;

        if (status === 400) {
          alert(backendMessage ?? 'Delete failed');
        } else if (status === 401) {
          alert('Please login');
        } else if (status === 403) {
          alert('You are not allowed to do this');
        } else {
          alert(backendMessage ?? 'Delete failed');
        }

        this.deleting = false;
      },
    });
  }
}
