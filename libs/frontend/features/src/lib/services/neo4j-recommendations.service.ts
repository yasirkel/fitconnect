import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecommendedClub {
  clubId: string;
  clubName: string;
  score: number;
}

@Injectable({ providedIn: 'root' })
export class Neo4jRecommendationsService {
  private apiUrl = 'http://localhost:3333/api/neo4j/enrollments';
  private http = inject(HttpClient);

  getRecommendedClubs(): Observable<RecommendedClub[]> {
    return this.http.get<RecommendedClub[]>(`${this.apiUrl}/recommendations/clubs`);
  }
}
