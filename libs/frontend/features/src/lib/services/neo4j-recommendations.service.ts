import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RecommendedClub {
  clubId: string;
  clubName: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class Neo4jRecommendationsService {
  private apiUrl = `${environment.apiUrl}/neo4j/enrollments`;
  private http = inject(HttpClient);

  getRecommendedClubs(): Observable<RecommendedClub[]> {
    return this.http.get<RecommendedClub[]>(`${this.apiUrl}/recommendations/clubs`);
  }
}
