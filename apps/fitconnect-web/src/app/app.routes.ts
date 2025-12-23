import { Route } from '@angular/router';
import {
  ClubsComponent,
  ClubDetailComponent,
  CreateClubComponent,
  EditClubComponent,
  TrainingCreateComponent,
  TrainingEditComponent,
  TrainingDetailComponent,
} from '@fitconnect/frontend-features';


export const appRoutes: Route[] = [
  { path: '', redirectTo: 'clubs', pathMatch: 'full' },

  // Training routes
  { path: 'trainings/create', component: TrainingCreateComponent },
  { path: 'trainings/:id/edit', component: TrainingEditComponent },
  { path: 'trainings/:id', component: TrainingDetailComponent },

  // Club routes
  { path: 'clubs/create', component: CreateClubComponent },
  { path: 'clubs/:id/edit', component: EditClubComponent },
  { path: 'clubs/:id', component: ClubDetailComponent },
  { path: 'clubs', component: ClubsComponent },
];

