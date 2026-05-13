import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { FiltrosRegistro, Formulario, OrdemServicoRequest, Page, PagedResponse } from '../model/ordem-de-servico';
import { AUTH_CONFIG } from '../auth/auth.config';

@Injectable({
  providedIn: 'root',
})
export class OrdemServico {

  private readonly apiUrl = `${AUTH_CONFIG.API_URL}/api/registros`;
  private readonly http = inject(HttpClient); // Injeção do HttpClient para comunicação com a API
  private readonly atualizarLista = new BehaviorSubject<void>(undefined); // Subject para acionar a atualização da lista de produtos
  readonly acaoAtualizarLista$ = this.atualizarLista.asObservable(); // Observable para acionar a atualização da lista de produtos

  // getOrdemDeServicos(): Observable<PagedResponse<Formulario>> {
  //   return this.http.get<PagedResponse<Formulario>>(this.apiUrl);
    
  // }

  salvarFormulario(dados: OrdemServicoRequest): Observable<Formulario> {
    return this.http.post<Formulario>(this.apiUrl, dados).pipe(
      tap(() => this.atualizarLista.next())
    );
  }

  atualizarFormulario(id: number, dados: Partial<Formulario>): Observable<Formulario> {
    return this.http.put<Formulario>(`${this.apiUrl}/${id}`, dados).pipe(
      tap(() => this.atualizarLista.next())
    );
  }

  concluirOrdem(id: number): Observable<Formulario> {
    return this.http.patch<Formulario>(`${this.apiUrl}/${id}/status/concluir`, {}).pipe(
    tap(() => this.atualizarLista.next())
  );
    // return this.http.patch<Formulario>(`${this.apiUrl}/${id}`, {
    //   status: 'Concluída',
    // }).pipe(
    //   tap(() => this.atualizarLista.next())
    // );
  }

  excluirFormulario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.atualizarLista.next())
    );
  }

  recarregar(): void { // Método para acionar a atualização da lista de produtos
    this.atualizarLista.next();
  }

  get produtosPendentesAtualizados$(): Observable<PagedResponse<Formulario>> { // Observable que emite a lista de produtos atualizada sempre que a ação de atualização é acionada
    return this.acaoAtualizarLista$.pipe(
      switchMap(() => this.buscarRegistros({ page: 0, size: 20, todos: false, pendentes: true, concluidos: false })), // Chama o método para buscar os produtos com os filtros desejados
      shareReplay(1)
    );
  }
  get produtosConcluidosAtualizados$(): Observable<PagedResponse<Formulario>> { // Observable que emite a lista de produtos atualizada sempre que a ação de atualização é acionada
    return this.acaoAtualizarLista$.pipe(
      switchMap(() => this.buscarRegistros({ page: 0, size: 20, todos: true, pendentes: false, concluidos: true })), // Chama o método para buscar os produtos com os filtros desejados
      shareReplay(1)
    );
  }
  get produtosAtualizados$(): Observable<PagedResponse<Formulario>> { // Observable que emite a lista de produtos atualizada sempre que a ação de atualização é acionada
    return this.acaoAtualizarLista$.pipe(
      switchMap(() => this.buscarRegistros({ page: 0, size: 20, todos: true, pendentes: false, concluidos: false })), // Chama o método para buscar os produtos com os filtros desejados
      shareReplay(1)
    );
  }

  // Busca de registros com filtros para histórico/pendentes/concluídos
  buscarRegistros(filtros: FiltrosRegistro): Observable<Page<Formulario>> { // Método para buscar registros com base nos filtros fornecidos
    let params = new HttpParams() // Criação dos parâmetros da requisição com base nos filtros
      .set('page', filtros.page.toString())
      .set('size', filtros.size.toString())
      .set('todos', filtros.todos.toString())
      .set('pendentes', filtros.pendentes.toString())
      .set('concluidos', filtros.concluidos.toString());

    if (filtros.dataReferencia) { // Se a data de referência for fornecida, adiciona ao parâmetro da requisição
      params = params.set('dataReferencia', filtros.dataReferencia.toISOString());
    }

    return this.http.get<Page<Formulario>>(this.apiUrl, { params }).pipe( // Realiza a requisição GET para buscar os registros com os parâmetros definidos
      catchError((err) => {
        console.error('Erro de comunicação na busca de registros:', err);
        return throwError(() => new Error('Falha ao recuperar as Ordens de Serviço do servidor.'));
      })
    );
  }
  
}