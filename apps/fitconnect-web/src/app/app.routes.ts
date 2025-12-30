import { Route } from '@angular/router';
import {
  ClubsComponent,
  ClubDetailComponent,
  CreateClubComponent,
  EditClubComponent,
  TrainingCreateComponent,
  TrainingEditComponent,
  TrainingDetailComponent,
  LoginComponent,
  RegisterComponent,
  authGuard, 
} from '@fitconnect/frontend-features';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'clubs', pathMatch: 'full' },

  // Training routes
  {
    path: 'trainings/create',
    component: TrainingCreateComponent,
    canActivate: [authGuard],
  },
  {
    path: 'trainings/:id/edit',
    component: TrainingEditComponent,
    canActivate: [authGuard],
  },
  { path: 'trainings/:id', component: TrainingDetailComponent },

  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Club routes
  {
    path: 'clubs/create',
    component: CreateClubComponent,
    canActivate: [authGuard],
  },
  {
    path: 'clubs/:id/edit',
    component: EditClubComponent,
    canActivate: [authGuard],
  },
  { path: 'clubs/:id', component: ClubDetailComponent },
  { path: 'clubs', component: ClubsComponent },
];
