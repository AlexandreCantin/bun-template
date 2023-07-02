export class Token {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  public getValue(): string {
    return this.token;
  }
}
