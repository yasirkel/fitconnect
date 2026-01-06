import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClubsService } from '../../services/clubs.service';
import { AuthService } from '../../services/auth.service';
import { Neo4jRecommendationsService, RecommendedClub } from '../../services/neo4j-recommendations.service';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, startWith } from 'rxjs/operators';
import { Club } from '@fitconnect/api';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule, AsyncPipe],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})

export class ClubsComponent implements OnInit {
    
// Inject the ClubsService, to fetch club data
  private clubsService = inject(ClubsService);

  // Component state, to hold clubs data, loading and error states
  clubs: Club[] = [];
  loading = true;
  error: string | null = null;
  private authService = inject(AuthService);
  loggedIn$ = this.authService.loggedIn$;
  private neo4j = inject(Neo4jRecommendationsService);

  // Recommendation state
  recommended$: Observable<RecommendedClub[] | null> = of(null);
  recommendationsError: string | null = null;

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

    // load recommendations when user is logged in
    // use `null` as the initial value to indicate loading in the template
    this.recommended$ = this.loggedIn$.pipe(
      switchMap((loggedIn) => {
        this.recommendationsError = null;
        if (!loggedIn) {
          return of<RecommendedClub[] | null>(null);
        }
        return this.neo4j.getRecommendedClubs().pipe(
          catchError((err) => {
            this.recommendationsError = err?.error?.message || err?.message || 'Failed to load recommendations';
            return of<RecommendedClub[]>([]);
          })
        );
      }),
      startWith<RecommendedClub[] | null>(null)
    );
  }
}
