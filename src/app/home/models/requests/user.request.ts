export class UserRequest {
  public Name: string;
  public UrlImage: string;

  constructor(params: Partial<UserRequest>) {
    this.Name = params.Name!;
    this.UrlImage = params.UrlImage!;
  }
}
