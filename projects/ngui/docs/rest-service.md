# rest-service

> Fonte: `projects/ngui/src/lib/services/rest.service.ts`

## Types / interfaces

### AtmPaginated

```ts
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
```

### AtmListQuery

```ts
export interface AtmListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // e.g. 'id:DESC'
  [key: string]: string | number | undefined;
}
```

### AtmRemoteDataSource

```ts
export interface AtmRemoteDataSource<T = Record<string, unknown>> {
  list(query: AtmListQuery): Observable<AtmPaginated<T>>;
}
```

