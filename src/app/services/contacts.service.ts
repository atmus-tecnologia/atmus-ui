import { Injectable } from '@angular/core';
import { AtmRestService } from '../../core/ui';

export interface Contact {
  id: number;
  name: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Example service for atm-dropdown-remote.
 * GET {serverUrl}/contacts?sortBy=id:DESC&page=1&search=term
 */
@Injectable({ providedIn: 'root' })
export class ContactsService extends AtmRestService<Contact> {
  protected override resource = 'contacts';
}
