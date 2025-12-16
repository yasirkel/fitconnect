import { Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClubsService, Club } from '../../services/clubs';

@Component({
  selector: 'app-edit-club',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule],
  templateUrl: './edit-club.component.html',
  styleUrl: './edit-club.component.css',
})
export class EditClubComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private clubsService = inject(ClubsService);

  clubId: string | null = null;

  loading = true;         // loading van bestaande club
  saving = false;         // saving tijdens PATCH
  error: string | null = null;

  // Form met dezelfde velden als Create
  form = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    description: [''],
    sportsOffered: ['', Validators.required], // comma separated string
    ownerId: [''],
  });

  ngOnInit(): void {
    // ID uit de URL halen
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'undefined') {
      this.error = 'No club id provided in URL';
      this.loading = false;
      return;
    }
    this.clubId = id;

    // 2) Club ophalen en formulier vullen
    this.clubsService.getOne(id).subscribe({
      next: (club: Club) => {
        this.form.patchValue({
          name: club.name,
          address: club.address,
          city: club.city,
          description: club.description ?? '',
          sportsOffered: club.sportsOffered.join(', '),
          ownerId: club.ownerId,
        });

        // ownerId niet editable maken (optioneel maar netjes)
        this.form.controls.ownerId.disable();

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading club for edit', err);
        this.error = 'Failed to load club';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (!this.clubId) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const value = this.form.getRawValue(); // ook disabled fields lezen

    const sportsArray =
      value.sportsOffered
        ?.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0) ?? [];

    // 3) PATCH sturen
    this.clubsService
      .updateClub(this.clubId, {
        name: value.name!,
        address: value.address!,
        city: value.city!,
        description: value.description || undefined,
        sportsOffered: sportsArray,
        // ownerId updaten we niet via PATCH (past bij UpdateClubDto)
      })
      .subscribe({
        next: () => {
          this.saving = false;
          // terug naar detailpagina
          this.router.navigate(['/clubs', this.clubId]);
        },
        error: (err) => {
          console.error('Error updating club', err);
          this.error = 'Failed to update club';
          this.saving = false;
        },
      });
  }
}
