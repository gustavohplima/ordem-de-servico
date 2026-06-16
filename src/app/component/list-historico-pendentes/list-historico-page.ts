import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { FiltrosRegistro, Formulario, Page, RegistroResponseDTO } from '../../model/ordem-de-servico';
import { NotificationService } from '../../services/notification.service';
import { OrdemServico } from '../../services/ordem-servico';

@Component({
  standalone: true,
  selector: 'app-list-historico-page',
  imports: [AsyncPipe, CommonModule, MatIconModule, FormsModule],
  templateUrl: './list-historico-page.html',
  styleUrl: './list-historico-page.css',
})
export class ListHistoricoPage implements OnInit {
  private readonly dataService = inject(OrdemServico); // Injeção do serviço de dados para comunicação com a API
  private readonly notificationService = inject(NotificationService); // Injeção do serviço de notificações para exibir mensagens ao usuário
  readonly loading = signal(true); // Signal para controlar o estado de carregamento da lista de produtos

  readonly lista$: Observable<Formulario[]> = this.dataService.produtosPendentesAtualizados$.pipe( // Observable que emite a lista de produtos atualizada sempre que a ação de atualização é acionada
    tap(() => this.loading.set(false)), //
    map((dados) => dados.content),//
      tap(resultado => console.log('Dados da lista:', resultado)),
    catchError(() => {
      this.loading.set(false);
      return of([]);
    })
  );

  

  ngOnInit(): void {
    this.lista$.subscribe(dados => {
      console.log('Chaves:', Object.keys(dados));
      console.log('Valores:', Object.values(dados));
});
    // O observable lista$ já é inicializado antes do template ser renderizado.
  }

  onConcluir(id: number): void {
    this.dataService.concluirOrdem(id).subscribe();
  }

  onExcluir(id: number): void {
    if (typeof window === 'undefined' || !window.confirm('Tem certeza que deseja excluir este formulário?')) {
      return;
    }

    this.dataService.excluirFormulario(id).subscribe({
      next: () => {
        this.notificationService.success('Ordem de serviço excluída com sucesso.');
      },
    });
  }
  ///////////////////////////////////////////////////////////////////////

  // Gerenciamento de estado utilizando Signals
  readonly registros = signal<RegistroResponseDTO[]>([]); // Signal para armazenar a lista de registros exibidos
  readonly paginaInfo = signal<Page<RegistroResponseDTO> | null>(null); //  Signal para armazenar as informações de paginação retornadas pela API
  readonly carregando = signal<boolean>(false); // Signal para controlar o estado de carregamento da lista de registros

  readonly filtros = signal<FiltrosRegistro>({ // Signal para armazenar os filtros de busca utilizados para recuperar os registros
    page: 0,
    size: 20,
    dataReferencia: undefined,
    todos: false,
    pendentes: false,
    concluidos: false
  }); // Signal para armazenar os filtros de busca utilizados para recuperar os registros

  buscar(): void {   // Método para buscar os registros com base nos filtros atuais
    this.carregando.set(true);
    
    this.dataService.buscarRegistros(this.filtros()).subscribe({ // Realiza a busca dos registros utilizando os filtros atuais
      next: (result) => {
        this.paginaInfo.set(result);
        this.registros.set(result.content);
        this.carregando.set(false);
      },
      error: () => { // Em caso de erro na comunicação com a API, exibe uma notificação de erro e limpa a lista de registros
        this.carregando.set(false);
        this.notificationService.error(
          'Não foi possível carregar os registros. Tente novamente mais tarde.', 
          'Erro na Operação'
        );
      }
    });
  }

  listarPendentes(): void { // Método para listar os registros pendentes, atualizando os filtros e buscando os registros
    this.filtros.update(f => ({ ...f, page: 0, todos: false, pendentes: true, concluidos: false }));
    this.buscar();
  }


  editando = signal(false);

  toggleEdit(ordem: Formulario): void {
    ordem.editando = !ordem.editando;
  }

  salvarEdicao(ordem: Formulario): void {
    const { editando, ...dadosParaSalvar } = ordem;
    this.dataService.atualizarFormulario(ordem.id, dadosParaSalvar).subscribe(() => {
      ordem.editando = false;
    });
  }
}
