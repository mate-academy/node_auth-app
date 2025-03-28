/* eslint-disable no-console */
export class ConsoleLogger {
  static log(...messages) {
    console.log(...messages);
  }

  static error(...messages) {
    console.error(...messages);
  }
}
