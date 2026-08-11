import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ATMUS_UI_CONFIG } from '../config';

/** Response shape returned by nest-paginator based APIs. */
export interface AtmPaginated<T> {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    sortBy?: [string, string][];
    search?: string;
  };
  links?: {
    first?: string;
    previous?: string;
    current?: string;
    next?: string;
    last?: string;
  };
}

export interface AtmListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // e.g. 'id:DESC'
  [key: string]: string | number | undefined;
}

/**
 * Contract used by remote components (atm-dropdown-remote).
 * Implement it in your feature services or just extend AtmRestService.
 */
export interface AtmRemoteDataSource<T = Record<string, unknown>> {
  list(query: AtmListQuery): Observable<AtmPaginated<T>>;
}

/**
 * Generic REST service for nest-paginator APIs.
 * Extend it and set `resource`:
 *
 *   @Injectable({ providedIn: 'root' })
 *   export class ContactsService extends AtmRestService<Contact> {
 *     protected override resource = 'contacts';
 *   }
 *
 * GET {serverUrl}/{resource}?sortBy=id:DESC&page=1&search=term
 */
@Injectable()
export abstract class AtmRestService<T = Record<string, unknown>>
  implements AtmRemoteDataSource<T>
{
  protected readonly http = inject(HttpClient);
  protected readonly config = inject(ATMUS_UI_CONFIG);

  /** Resource path, e.g. 'contacts'. */
  protected abstract resource: string;

  protected get baseUrl(): string {
    return `${this.config.serverUrl ?? ''}/${this.resource}`;
  }

  list(query: AtmListQuery = {}): Observable<AtmPaginated<T>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<AtmPaginated<T>>(this.baseUrl, { params });
  }

  get(id: string | number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  create(body: Partial<T>): Observable<T> {
    return this.http.post<T>(this.baseUrl, body);
  }

  update(id: string | number, body: Partial<T>): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
