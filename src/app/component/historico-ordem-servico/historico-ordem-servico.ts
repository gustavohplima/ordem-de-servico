import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FiltrosRegistro, Formulario, Page, RegistroResponseDTO } from '../../model/ordem-de-servico';
import { OrdemServico } from '../../services/ordem-servico';
import { NotificationService } from '../../services/notification.service';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-historico-ordem-servico',
  imports: [CommonModule, MatIconModule],
  templateUrl: './historico-ordem-servico.html',
  styleUrl: './historico-ordem-servico.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoricoOrdemServico implements OnInit {
  readonly loading = signal(true);
  private readonly dataService = inject(OrdemServico)
  private readonly notificationService = inject(NotificationService);

  readonly registrosConcluidos$: Observable<Formulario[]> = this.dataService.produtosConcluidosAtualizados$.pipe(
    tap(() => this.loading.set(false)), //
    map((dados) => dados.content),//
    catchError(() => {
      this.loading.set(false);
      return of([]);
    })
  );

  ngOnInit(): void {
    // O observable lista$ já é inicializado antes do template ser renderizado.
  }

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
  });  

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

  listarConcluidos(): void {
    this.filtros.update(f => ({ ...f, page: 0, todos: false, pendentes: false, concluidos: true }));
    this.buscar();
  }
  
}
