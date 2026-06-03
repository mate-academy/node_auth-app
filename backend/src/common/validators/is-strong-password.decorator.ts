import { applyDecorators } from '@nestjs/common';
import { Matches, MinLength } from 'class-validator';
import {
  PASSWORD_RULE_PATTERNS,
  PASSWORD_VALIDATION_MESSAGES,
} from './password-rules';

/** Same rules as frontend passwordSchema (Zod). */
export function IsStrongPassword() {
  return applyDecorators(
    MinLength(8, { message: PASSWORD_VALIDATION_MESSAGES.minLength }),
    Matches(PASSWORD_RULE_PATTERNS.uppercase, {
      message: PASSWORD_VALIDATION_MESSAGES.uppercase,
    }),
    Matches(PASSWORD_RULE_PATTERNS.lowercase, {
      message: PASSWORD_VALIDATION_MESSAGES.lowercase,
    }),
    Matches(PASSWORD_RULE_PATTERNS.number, {
      message: PASSWORD_VALIDATION_MESSAGES.number,
    }),
    Matches(PASSWORD_RULE_PATTERNS.special, {
      message: PASSWORD_VALIDATION_MESSAGES.special,
    }),
  );
}
