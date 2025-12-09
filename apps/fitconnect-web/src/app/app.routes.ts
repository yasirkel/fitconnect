import { Route } from '@angular/router';
import { ClubsComponent } from './components/clubs/clubs.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'clubs', pathMatch: 'full' },
  { path: 'clubs', component: ClubsComponent },
];
