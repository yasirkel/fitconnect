import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Enrollment } from '../models/enrollment.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private http = inject(HttpClient);

  // gebruik dezelfde baseUrl-stijl als je andere services
  private baseUrl = 'http://localhost:3333/api';

  enroll(trainingId: string, userId: string) {
    return this.http.post<Enrollment>(`${this.baseUrl}/enrollments`, {
      trainingId,
      userId,
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
