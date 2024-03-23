// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Validator {
  static isNotEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  static isCorrectNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  static isEmail(value: unknown): value is string {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(String(value));
  }

  static isStrongPassword(value: unknown): value is string {
    return Validator.isNotEmptyString(value) && value.length >= 8;
  }

  static isURL(value: unknown): value is string {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    return urlRegex.test(String(value));
  }

  static isUUID(value: unknown): value is string {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return regex.test(String(value));
  }
}
