import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiUrl = 'http://localhost:3000/getweatherData';
  constructor(private http: HttpClient) { }
  fetchWeatherData(latitude:number,longitude:number): Observable<any>{
    console.log(latitude,longitude)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { latitude, longitude };
    return this.http.post(this.apiUrl, body, { headers });
  }
}
