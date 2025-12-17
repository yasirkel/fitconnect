import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Training } from '../components/club-detail/training.model';


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
		return this.http.get<any[]>(this.apiUrl).pipe(
			map((arr) => arr.map(normalizeClub))
		);
	}

	getOne(id: string): Observable<Club> {
		return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(normalizeClub));
	}

	// Nieuwe club aanmaken (POST)
	createClub(data: Omit<Club, 'id' | 'createdAt'>): Observable<Club> {
		return this.http
			.post<any>(this.apiUrl, data)
			.pipe(map(normalizeClub));
	}

	// Club updaten (PATCH)
	updateClub(
		id: string,
		data: Partial<Omit<Club, 'id' | 'createdAt'>>
	): Observable<Club> {
		return this.http
			.patch<any>(`${this.apiUrl}/${id}`, data)
			.pipe(map(normalizeClub));
	}

	// Club verwijderen (DELETE)
	deleteClub(id: string): Observable<{ success: boolean }> {
		return this.http.delete<{ success: boolean }>(
			`${this.apiUrl}/${id}`
		);
	}

	getTrainingsByClubId(clubId: string) {
  	return this.http.get<Training[]>(`${this.apiUrl}/${clubId}/trainings`
  );
}

}

function normalizeClub(c: any): Club {
	return {
		id: c.id ?? (c._id ? String(c._id) : ''),
		name: c.name,
		address: c.address,
		city: c.city,
		description: c.description,
		sportsOffered: Array.isArray(c.sportsOffered) ? c.sportsOffered : [],
		ownerId: c.ownerId ?? c.owner ?? '',
		createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : ''
	} as Club;
}



