import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ClubsService } from '../../services/clubs';

@Component({
  selector: 'app-create-club',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './create-club.component.html',
  styleUrl: './create-club.component.css',
})
export class CreateClubComponent {
  private fb = inject(FormBuilder);
  private clubsService = inject(ClubsService);
  private router = inject(Router);

  // 🔹 Reactive Form definiëren
  form = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    description: [''],
    sportsOffered: ['', Validators.required], // comma separated string
    ownerId: ['owner-1', Validators.required], // tijdelijk hardcoded
  });

  loading = false;
  error: string | null = null;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const value = this.form.value;

    // sportsOffered van "fitness, yoga" → ["fitness", "yoga"]
    const sportsArray =
      value.sportsOffered
        ?.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0) ?? [];

    this.clubsService
      .createClub({
        name: value.name!,
        address: value.address!,
        city: value.city!,
        description: value.description || undefined,
        sportsOffered: sportsArray,
        ownerId: value.ownerId!,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          // Na succesvol aanmaken terug naar de lijst
          this.router.navigate(['/clubs']);
        },
        error: (err) => {
          console.error('Error creating club', err);
          this.error = 'Failed to create club';
          this.loading = false;
        },
      });
  }
}
