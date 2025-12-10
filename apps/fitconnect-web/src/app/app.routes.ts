import { Route } from '@angular/router';
import { ClubsComponent } from './components/clubs/clubs.component';
import { ClubDetailComponent } from './components/club-detail/club-detail.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'clubs', pathMatch: 'full' },
  { path: 'clubs', component: ClubsComponent },
  { path: 'clubs/:id', component: ClubDetailComponent },
];
