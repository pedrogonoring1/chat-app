import { Injectable } from '@angular/core';
import { AES, enc } from 'crypto-js';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class CriptografyService {

  private readonly CHAVE = environment.chaveCript;

  public criptografarContent(content: string): string {
    const chaveCriptografia = this.CHAVE;
    const numeroCriptografado = AES.encrypt(content, chaveCriptografia).toString();
    const hashCriptografado = encodeURIComponent(numeroCriptografado);
    return hashCriptografado;
  }

  public descriptografarContent(contentCriptografado: string): string {
    const chaveCriptografia = this.CHAVE;
    const bytesDescriptografados = AES.decrypt(decodeURIComponent(contentCriptografado), chaveCriptografia);
    const textDescriptografado = bytesDescriptografados.toString(enc.Utf8);
    return textDescriptografado;
  }
}
