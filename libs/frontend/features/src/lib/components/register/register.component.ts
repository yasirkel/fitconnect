import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@fitconnect/frontend-features';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const { displayName, email, password } = this.form.value;

    this.auth.register(email!, password!, displayName!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/clubs']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Register failed';
      },
    });
  }
}
