import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Club, Training } from '@fitconnect/api';
import { CreateClubDto } from '@fitconnect/dto';
import { TrainingsService } from '@fitconnect/frontend-features';
import { environment } from 'src/environments/environment';

// Re-export for backward compatibility
export type { Club };

@Injectable({
	providedIn: 'root',
})
export class ClubsService {
	private apiUrl = `${environment.apiUrl}/clubs`;
	private http = inject(HttpClient);
	private trainingsService = inject(TrainingsService);

	getAll(): Observable<Club[]> {
		return this.http.get<any[]>(this.apiUrl).pipe(
			map((arr) => arr.map(normalizeClub))
		);
	}

	getOne(id: string): Observable<Club> {
		return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(normalizeClub));
	}

	// Nieuwe club aanmaken (POST) - use backend CreateClubDto (ownerId derived from JWT)
	createClub(data: CreateClubDto): Observable<Club> {
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
		// delegate to TrainingsService to avoid duplicating API URL
		return this.trainingsService.getByClub(clubId);
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
