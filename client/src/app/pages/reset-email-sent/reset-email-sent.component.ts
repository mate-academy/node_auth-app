import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reset-email-sent',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './reset-email-sent.component.html',
})
export class ResetEmailSentComponent {
  email: string | null =
    (history.state as { email?: string } | null)?.email ?? null;
}
