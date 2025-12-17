import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClubsService, Club } from '../../services/clubs';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';


import { Training } from './training.model';



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

  club: Club | null = null;
  loading = true;
  error: string | null = null;
  deleting = false;

  trainings: Training[] = [];
  trainingsLoading = true;
  trainingsError: string | null = null;


  ngOnInit(): void {
    // Lees het :id deel uit de URL
    const id = this.route.snapshot.paramMap.get('id');

    if (!id || id === 'undefined') {
      this.error = 'No club id provided in URL';
      this.loading = false;
      return;
    }

    // Haal de trainingen van deze club op via de service
    this.clubsService.getTrainingsByClubId(id).subscribe({
      next: (data) => {
        this.trainings = data;
        this.trainingsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching trainings', err);
        this.trainingsError = 'Failed to load trainings';
        this.trainingsLoading = false;
      },
    });

    // Haal de club details op via de service
    this.clubsService.getOne(id).subscribe({
      next: (data) => {
        this.club = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching club detail', err);
        this.error = 'Failed to load club details';
        this.loading = false;
      },
    });
  }

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
      this.error = 'Failed to delete club';
      this.deleting = false;
    },
  });
}

}
