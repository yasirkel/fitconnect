import { Component, OnInit, inject,  } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private sub?: Subscription;


  loggedIn = false;
  email: string | null = null;

  ngOnInit(): void {
    this.sub = this.auth.loggedIn$.subscribe((loggedIn) => {
        this.loggedIn = loggedIn;

        if (!loggedIn) {
        this.email = null;
        return;
        }

        this.auth.me().subscribe({
        next: (me) => (this.email = me.email),
        error: () => {
            this.auth.logout();
            this.loggedIn = false;
            this.email = null;
        },
        });
    });
 }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }



  refresh(): void {
    this.loggedIn = this.auth.isLoggedIn();

    if (!this.loggedIn) {
      this.email = null;
      return;
    }

    this.auth.me().subscribe({
      next: (me) => {
        this.email = me.email;
      },
      error: () => {
        // token ongeldig/expired -> reset
        this.auth.logout();
        this.loggedIn = false;
        this.email = null;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.loggedIn = false;
    this.email = null;
    this.router.navigate(['/login']);
  }
}
