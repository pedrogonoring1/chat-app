export class UserOnlineResponse {
  public nome: string;
  public urlImage: string;
  public ativo: boolean;
  public class: string;

  constructor(params: Partial<UserOnlineResponse>) {
    this.nome = params.nome!;
    this.urlImage = params.urlImage!;
    this.ativo = params.ativo!;
    this.class = params.class!;
  }
}
