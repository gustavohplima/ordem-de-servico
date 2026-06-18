import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FiltrosRegistro, Formulario, Page, RegistroResponseDTO } from '../../model/ordem-de-servico';
import { OrdemServico } from '../../services/ordem-servico';
import { NotificationService } from '../../services/notification.service';
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';

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
  readonly carregandoPdfId = signal<number | null>(null);
  private readonly dataService = inject(OrdemServico);
  private readonly notificationService = inject(NotificationService);

  readonly registrosConcluidos$: Observable<Formulario[]> = this.dataService.produtosConcluidosAtualizados$.pipe(
    tap(() => this.loading.set(false)),
    map((dados) => dados.content),
    catchError(() => {
      this.loading.set(false);
      return of([]);
    })
  );

  ngOnInit(): void {
    // O observable lista$ já é inicializado antes do template ser renderizado.
  }

  readonly registros = signal<RegistroResponseDTO[]>([]);
  readonly paginaInfo = signal<Page<RegistroResponseDTO> | null>(null);
  readonly carregando = signal<boolean>(false);

  readonly filtros = signal<FiltrosRegistro>({
    page: 0,
    size: 20,
    dataReferencia: undefined,
    todos: false,
    pendentes: false,
    concluidos: false,
  });

  buscar(): void {
    this.carregando.set(true);

    this.dataService.buscarRegistros(this.filtros()).subscribe({
      next: (result) => {
        this.paginaInfo.set(result);
        this.registros.set(result.content);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.notificationService.error(
          'Não foi possível carregar os registros. Tente novamente mais tarde.',
          'Erro na Operação'
        );
      },
    });
  }

  listarConcluidos(): void {
    this.filtros.update((f) => ({ ...f, page: 0, todos: false, pendentes: false, concluidos: true }));
    this.buscar();
  }

  itemExpandidoId = signal<number | null>(null);

  alternarExpansao(id: number): void {
    this.itemExpandidoId.update((idAtual) => (idAtual === id ? null : id));
  }

  async abrirComprovante(id: number): Promise<void> {
    this.carregandoPdfId.set(id);

    try {
      const blob = await firstValueFrom(this.dataService.obterComprovante(id));
      this.abrirBlobPdf(blob);
    } catch {
      this.notificationService.error(
       // 'Não foi possível abrir o comprovante desta ordem.',
        'PDF GERADO'
      );
    } finally {
      this.carregandoPdfId.set(null);
    }
  }

  async imprimirComprovante(id: number): Promise<void> {
    await this.abrirComprovante(id);
  }

  async enviarViaWhatsApp(id: number): Promise<void> {
    return;
  }

  private abrirBlobPdf(blob: Blob): void {
    const pdfBlob = blob.type === 'application/pdf'
      ? blob
      : new Blob([blob], { type: 'application/pdf' });

    const fileUrl = URL.createObjectURL(pdfBlob);
    const popup = window.open(fileUrl, '_blank', 'noopener,noreferrer');

    if (popup) {
      popup.addEventListener('load', () => {
        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      }, { once: true });
    } else {
      URL.revokeObjectURL(fileUrl);
      this.notificationService.error(
        'O navegador bloqueou a abertura da pré-visualização do PDF.',
        'Bloqueio de Pop-up'
      );
    }
  }
}
