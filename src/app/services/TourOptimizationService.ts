import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RENDER_DOT_COM_BACKEND_URL } from '../config';

@Injectable({
  providedIn: 'root',
})
export class TourOptimizationService {
  private apiUrl = RENDER_DOT_COM_BACKEND_URL && RENDER_DOT_COM_BACKEND_URL.trim() !== '' 
    ? `${RENDER_DOT_COM_BACKEND_URL}/optimize-tours` 
    : 'http://localhost:3000/optimize-tours';
  // URL to Express backend
  constructor(private http: HttpClient) {}
  // Function to optimize tours
  optimizeTours(deliveries: any[], vehicleStartLocation: any, globalStartTime: string, globalEndTime: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      deliveries,
      vehicleStartLocation,
      globalStartTime,
      globalEndTime
    };
    return this.http.post(this.apiUrl, body, { headers });
  }
}
