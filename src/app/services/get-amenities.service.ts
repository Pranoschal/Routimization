import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GetAmenitiesService {

  constructor(private http:HttpClient) { }
  private apiUrl = 'http://localhost:3000/getAmenities';
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
