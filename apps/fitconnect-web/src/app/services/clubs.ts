import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Club {
  id: string;
  name: string;
  address: string;
  city: string;
  description?: string;
  sportsOffered: string[];
  ownerId: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClubsService {
  // Backend NestJS app listens on port 3333 by default in this workspace.
  // Use explicit port to avoid confusion while developing locally.
  private apiUrl = 'http://localhost:3333/api/clubs';
  private http = inject(HttpClient);

  getAll(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl);
  }

  getOne(id: string): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`);
  }
}
