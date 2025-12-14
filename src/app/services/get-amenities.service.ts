import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { RENDER_DOT_COM_BACKEND_URL } from '../config';


@Injectable({
  providedIn: 'root'
})
export class GetAmenitiesService {

  constructor(private http:HttpClient) { }
  private apiUrl = RENDER_DOT_COM_BACKEND_URL && RENDER_DOT_COM_BACKEND_URL.trim() !== '' 
    ? `${RENDER_DOT_COM_BACKEND_URL}/getAmenities` 
    : 'http://localhost:3000/getAmenities';
  getAmenities(deliveries: any[],amenityType:string, radius: number):Observable<any>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const requests = deliveries.map(delivery => {
      return this.http.post<any>(this.apiUrl, {
        latitude: delivery.latitude,
        longitude: delivery.longitude,
        type: amenityType,
        radius : radius
      }, { headers });
    });
    return forkJoin(requests);
  }

}
