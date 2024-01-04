export class MessageResponse {
  public NomeUser: string;
  public Horario: string;
  public Content: string;
  public Owner: string;
  public UrlImage: string;
  public Type: string;
  public Class: string;

  constructor(params: Partial<MessageResponse>) {
    this.NomeUser = params.NomeUser!;
    this.Horario = params.Horario!;
    this.Content = params.Content!;
    this.Owner = params.Owner!;
    this.UrlImage = params.UrlImage!;
    this.Type = params.Type!;
    this.Class = params.Class!;
  }
}
