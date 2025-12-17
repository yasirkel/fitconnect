import { Route } from '@angular/router';
import { ClubsComponent } from './components/clubs/clubs.component';
import { ClubDetailComponent } from './components/club-detail/club-detail.component';
import { CreateClubComponent } from './components/create-club/create-club.component';
import { EditClubComponent } from './components/edit-club/edit-club.component';
import { TrainingCreateComponent } from './components/training-create/training-create.component';
import { TrainingEditComponent } from './components/training-edit/training-edit.component';
import { TrainingDetailComponent } from './components/training-detail/training-detail.component';


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

