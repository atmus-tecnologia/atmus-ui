import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AtmListQuery, AtmPaginated, AtmRemoteDataSource } from '@atmus/ngui';

export interface DummyUser extends Record<string, unknown> {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  university: string;
  birthDate: string;
  image: string;
  role: string;
  company: { name: string; title: string; department: string };
  address: { city: string; state: string; country: string };
}

interface DummyUsersResponse {
  users: DummyUser[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Adapter that exposes https://dummyjson.com/users through the
 * AtmRemoteDataSource contract so it can feed <atm-table [dataSource]>.
 *
 * dummyjson uses limit/skip instead of page, sortBy/order for sorting and a
 * dedicated /filter endpoint for equality filters — this service translates
 * the nest-paginator style AtmListQuery into those params.
 */
@Injectable({ providedIn: 'root' })
export class DummyUsersService implements AtmRemoteDataSource<DummyUser> {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://dummyjson.com/users';

  list(query: AtmListQuery): Observable<AtmPaginated<DummyUser>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    let url = this.baseUrl;
    let params = new HttpParams().set('limit', limit).set('skip', (page - 1) * limit);

    // sortBy 'firstName:ASC' -> sortBy=firstName&order=asc
    if (query.sortBy) {
      const [key, dir] = String(query.sortBy).split(':');
      params = params.set('sortBy', key).set('order', (dir ?? 'asc').toLowerCase());
    }

    // dummyjson only supports one equality filter via /users/filter?key=&value=
    const filter = Object.entries(query).find(([k]) => k.startsWith('filter.'));
    if (filter) {
      const key = filter[0].slice('filter.'.length);
      const value = String(filter[1]).split(':').pop() ?? '';
      url = `${this.baseUrl}/filter`;
      params = params.set('key', key).set('value', value);
    } else if (query.search) {
      url = `${this.baseUrl}/search`;
      params = params.set('q', String(query.search));
    }

    return this.http.get<DummyUsersResponse>(url, { params }).pipe(
      map((res) => ({
        data: res.users,
        meta: {
          itemsPerPage: res.limit,
          totalItems: res.total,
          currentPage: page,
          totalPages: Math.max(Math.ceil(res.total / limit), 1),
        },
      })),
    );
  }
}
