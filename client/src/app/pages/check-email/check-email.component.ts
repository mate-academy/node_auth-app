import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './check-email.component.html',
})
export class CheckEmailComponent {
  email: string | null =
    (history.state as { email?: string } | null)?.email ?? null;
}
