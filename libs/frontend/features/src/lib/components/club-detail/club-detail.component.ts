import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';

import { ClubsService } from '../../services/clubs.service';
import { Training } from '@fitconnect/api';

import { EnrollmentsService } from '../../services/enrollments.service';
import { Club, Enrollment } from '@fitconnect/api';

import { AuthService } from '@fitconnect/frontend-features';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DatePipe],
  templateUrl: './club-detail.component.html',
  styleUrls: ['./club-detail.component.css'],
})
export class ClubDetailComponent implements OnInit {
  // services via dependency injection
  private route = inject(ActivatedRoute);
  private clubsService = inject(ClubsService);
  private router = inject(Router);
  private enrollmentsService = inject(EnrollmentsService);
  private authService = inject(AuthService);

  club: Club | null = null;
  loading = true;
  error: string | null = null;
  deleting = false;

  meUserId: string | null = null;
  isOwner = false;
  loggedIn$ = this.authService.loggedIn$;


  trainings: Training[] = [];
  trainingsLoading = true;
  trainingsError: string | null = null;

  // authenticated user id (populated from AuthService)
  // `meUserId` is set in ngOnInit via `authService.me()`

  // enrollment state per training
  enrollmentsByTraining: Record<string, Enrollment[]> = {};
  enrollmentsLoadingByTraining: Record<string, boolean> = {};
  enrollmentsErrorByTraining: Record<string, string | null> = {};

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id || id === 'undefined') {
      this.error = 'No club id provided in URL';
      this.loading = false;
      this.trainingsLoading = false;
      return;
    }

    // Laad trainingen van de club
    this.clubsService.getTrainingsByClubId(id).subscribe({
      next: (data) => {
        this.trainings = data;
        this.trainingsLoading = false;

        // nadat de trainingen zijn geladen, haal de inschrijvingen per training op
        for (const t of this.trainings) {
          this.loadEnrollmentsForTraining(t.id);
        }
      },
      error: (err) => {
        console.error('Error fetching trainings', err);
        this.trainingsError = 'Failed to load trainings';
        this.trainingsLoading = false;
      },
    });

    // Laad club details
    this.clubsService.getOne(id).subscribe({
      next: (data) => {
        this.club = data;
        this.isOwner = !!this.meUserId && this.club.ownerId === this.meUserId;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching club detail', err);
        this.error = 'Failed to load club details';
        this.loading = false;
      },
    });

    this.authService.me().subscribe({
     next: (me) => {
    this.meUserId = me.userId;
    this.isOwner = !!this.club && this.club.ownerId === this.meUserId;
      },
      error: () => {
        this.meUserId = null;
        this.isOwner = false;
      },
    });

  }

  // Enrollments laden voor een training
  loadEnrollmentsForTraining(trainingId: string): void {
    this.enrollmentsLoadingByTraining[trainingId] = true;
    this.enrollmentsErrorByTraining[trainingId] = null;

    this.enrollmentsService.getByTraining(trainingId).subscribe({
      next: (data) => {
        this.enrollmentsByTraining[trainingId] = data;
        this.enrollmentsLoadingByTraining[trainingId] = false;
      },
      error: (err) => {
        console.error('Error fetching enrollments for training', trainingId, err);
        this.enrollmentsErrorByTraining[trainingId] =
          'Failed to load enrollments';
        this.enrollmentsLoadingByTraining[trainingId] = false;
      },
    });
  }

  // Aantal ingeschrijvingen voor een training
  getEnrolledCount(trainingId: string): number {
    return this.enrollmentsByTraining[trainingId]?.length ?? 0;
  }

  // Inschrijven voor een training
  enroll(trainingId: string) {
    this.enrollmentsService.enroll(trainingId).subscribe({
      next: () => {
        this.loadEnrollmentsForTraining(trainingId);
      },
      error: (err) => {
        alert(err?.error?.message ?? 'Failed to enroll');
      },
    });
  }

  // Controleren of de user is ingeschreven voor een training
  isEnrolled(trainingId: string): boolean {
    if (!this.meUserId) return false;
    return (this.enrollmentsByTraining[trainingId] ?? []).some(
      (e) => e.userId === this.meUserId
    );
  }

  // Controleren of een training vol is
  isFull(trainingId: string, capacity: number): boolean {
    return this.getEnrolledCount(trainingId) >= capacity;
  }

  // Uitschrijven voor een training
  unenroll(trainingId: string) {
    if (!this.meUserId) return;

    const enrollment = (this.enrollmentsByTraining[trainingId] ?? []).find(
      (e) => e.userId === this.meUserId
    );

    if (!enrollment) return;

    this.enrollmentsService.remove(enrollment.id).subscribe({
      next: () => {
        this.loadEnrollmentsForTraining(trainingId);
      },
      error: () => {
        alert('Failed to unenroll');
      },
    });
  }


  // Club verwijderen
  onDelete(): void {
    if (!this.club) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${this.club.name}"?`
    );

    if (!confirmed) return;

    this.deleting = true;
    this.error = null;

    this.clubsService.deleteClub(this.club.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/clubs']);
      },
      error: (err) => {
        console.error('Error deleting club', err);
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
