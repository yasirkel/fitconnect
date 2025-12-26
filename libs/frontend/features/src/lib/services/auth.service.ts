import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, MeResponse } from '@fitconnect/api';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:3333/api/auth';
  private readonly tokenKey = 'token';

  // Observable om login status bij te houden
  private readonly _loggedIn$ = new BehaviorSubject<boolean>(this.isLoggedIn());
  loggedIn$ = this._loggedIn$.asObservable();


  constructor(private http: HttpClient) {}

  register(email: string, password: string, displayName: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { email, password, displayName })
      .pipe(tap((res) => this.setToken(res.token)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.setToken(res.token)));
  }

  me(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.baseUrl}/me`);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._loggedIn$.next(false); // Update login status observable
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this._loggedIn$.next(true); // Update login status observable
  }
}
