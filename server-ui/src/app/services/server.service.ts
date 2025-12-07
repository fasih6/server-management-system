import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Server } from '../interface/server';
import { CustomResponse } from '../interface/custom-response';
import { Status } from '../enum/status.enum';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  private baseUrl = 'http://localhost:8080/server';

  constructor(private http: HttpClient) {}

  getServers$(): Observable<CustomResponse> {
    return this.http.get<CustomResponse>(`${this.baseUrl}/list`).pipe(
      tap((res) => console.log('Servers loaded:', res)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  saveServer$(server: Server): Observable<CustomResponse> {
    return this.http.post<CustomResponse>(`${this.baseUrl}/save`, server).pipe(
      tap((res) => console.log('Server saved:', res)),
      catchError(this.handleError)
    );
  }

  pingServer$(ipAddress: string): Observable<CustomResponse> {
    return this.http
      .get<CustomResponse>(`${this.baseUrl}/ping/${ipAddress}`)
      .pipe(
        tap((res) => console.log('Server pinged:', res)),
        catchError(this.handleError)
      );
  }

  deleteServer$(id: number): Observable<CustomResponse> {
    return this.http
      .delete<CustomResponse>(`${this.baseUrl}/delete/${id}`)
      .pipe(
        tap((res) => console.log('Server deleted:', res)),
        catchError(this.handleError)
      );
  }

  filterServers$(
    status: Status,
    response: CustomResponse
  ): Observable<CustomResponse> {
    return new Observable<CustomResponse>((subscriber) => {
      const allServers = response.data.servers ?? [];
      const filteredServers =
        status === Status.ALL
          ? allServers
          : allServers.filter((server) => server.status === status);

      // Build message
      let message =
        status === Status.ALL
          ? 'Showing all servers'
          : filteredServers.length > 0
          ? `Servers filtered by ${status}`
          : `No servers found with status: ${status}`;

      // Emit new response object
      subscriber.next({
        ...response,
        message,
        data: {
          servers: filteredServers,
        },
      });

      subscriber.complete();
    }).pipe(
      tap((res) => console.log('Filtered result:', res)),
      catchError(this.handleError)
    );
  }
}
