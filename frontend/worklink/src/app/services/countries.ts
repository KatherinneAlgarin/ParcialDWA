import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private apiUrl = 'https://restcountries.com/v3.1/all?fields=name,cca2,flags,translations';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los países, ordenados por su nombre en español.
   */
  getAllCountries(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(paises => {
        // Ordena usando la traducción al español o el nombre común
        return paises.sort((a, b) => {
          const nameA = a.translations?.spa?.common || a.name.common;
          const nameB = b.translations?.spa?.common || b.name.common;
          return nameA.localeCompare(nameB);
        });
      })
    );
  }
}