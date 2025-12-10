import { Route } from '@angular/router';
import { ClubsComponent } from './components/clubs/clubs.component';
import { ClubDetailComponent } from './components/club-detail/club-detail.component';
import { CreateClubComponent } from './components/create-club/create-club.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'clubs', pathMatch: 'full' },

  // Altijd specifiece routes eerst neerzetten
  { path: 'clubs/create', component: CreateClubComponent },
  { path: 'clubs/:id', component: ClubDetailComponent },
  { path: 'clubs', component: ClubsComponent },

];
