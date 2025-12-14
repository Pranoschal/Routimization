import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RENDER_DOT_COM_BACKEND_URL } from '../config';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = RENDER_DOT_COM_BACKEND_URL && RENDER_DOT_COM_BACKEND_URL.trim() !== '' 
    ? `${RENDER_DOT_COM_BACKEND_URL}/getweatherData` 
    : 'http://localhost:3000/getweatherData';
  constructor(private http: HttpClient) { }
  fetchWeatherData(latitude:number,longitude:number): Observable<any>{
    console.log(latitude,longitude)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { latitude, longitude };
    return this.http.post(this.apiUrl, body, { headers });
  }
}
