import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ClubsService, Club } from '../../services/clubs';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.css'
})

export class ClubsComponent implements OnInit {
    
// Inject the ClubsService, to fetch club data
  private clubsService = inject(ClubsService);

// Component state, to hold clubs data, loading and error states
  clubs: Club[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.clubsService.getAll().subscribe({
      next: (data) => {
        this.clubs = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching clubs', err);
        this.error = 'Failed to load clubs';
        this.loading = false;
      },
    });
  }
}
