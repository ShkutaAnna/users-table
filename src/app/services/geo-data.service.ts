import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, ReplaySubject } from 'rxjs';
import { City } from '../interfaces/City';

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private geoDataUrl = 'geo-data.json';
  private sitiesSubject = new ReplaySubject<City[]>(1);

  constructor(private http: HttpClient) {
    this.loadGeoData();
  }

  private loadGeoData(): void {
    this.http.get<{ cities: City[] }>(this.geoDataUrl).subscribe((data) => {
      this.sitiesSubject.next(data.cities);
    });
  }

  public getCities(): Observable<City[]> {
    return this.sitiesSubject.asObservable().pipe(
      map((cities) => cities)
    );
  }
}
