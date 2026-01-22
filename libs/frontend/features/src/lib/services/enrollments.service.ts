import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Enrollment } from '@fitconnect/api';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private http = inject(HttpClient);

  private baseUrl = environment.apiUrl;

  enroll(trainingId: string) {
    return this.http.post<Enrollment>(`${this.baseUrl}/enrollments`, {
      trainingId,
    });
  }

  getByTraining(trainingId: string) {
    return this.http.get<Enrollment[]>(
      `${this.baseUrl}/enrollments/trainings/${trainingId}`
    );
  }

  getByUser(userId: string) {
    return this.http.get<Enrollment[]>(
      `${this.baseUrl}/enrollments/users/${userId}`
    );
  }

  remove(enrollmentId: string) {
    return this.http.delete<{ success: true }>(
      `${this.baseUrl}/enrollments/${enrollmentId}`
    );
  }
}
