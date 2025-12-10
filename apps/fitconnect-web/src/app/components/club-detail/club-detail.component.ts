import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClubsService, Club } from '../../services/clubs';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './club-detail.component.html',
  styleUrl: './club-detail.component.css',
})
export class ClubDetailComponent implements OnInit {
  // services via dependency injection
  private route = inject(ActivatedRoute);
  private clubsService = inject(ClubsService);

  club: Club | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    // Lees het :id deel uit de URL
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No club id provided in URL';
      this.loading = false;
      return;
    }

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
}
