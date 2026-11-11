import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PASSWORD_RULES } from '../../core/utils/password-rules';

@Component({
  selector: 'app-password-rules',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './password-rules.component.html',
  styleUrl: './password-rules.component.scss',
})
export class PasswordRulesComponent {
  @Input() password = '';

  rules = PASSWORD_RULES;
}
