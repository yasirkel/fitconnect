import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Training } from '@fitconnect/api';

@Injectable({ providedIn: 'root' })
export class TrainingsService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3333/api';

  createTraining(data: any) {
    return this.http.post<Training>(`${this.baseUrl}/trainings`, data);
  }

  getOne(id: string) {
    return this.http.get<Training>(`${this.baseUrl}/trainings/${id}`);
  }

  update(id: string, data: any) {
    return this.http.patch(`${this.baseUrl}/trainings/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/trainings/${id}`);
  }
}
