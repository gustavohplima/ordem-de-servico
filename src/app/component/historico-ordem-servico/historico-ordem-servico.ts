import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { FiltrosRegistro, Formulario, Page, RegistroResponseDTO } from '../../model/ordem-de-servico';
import { OrdemServico } from '../../services/ordem-servico';
import { NotificationService } from '../../services/notification.service';
import { catchError, firstValueFrom, map, Observable, of, tap } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');

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

    const novaAba = window.open('about:blank', '_blank');

    if (!novaAba) {
      this.notificationService.error('Por favor, permita pop-ups para este site.', 'Bloqueio de Pop-up');
      this.carregandoPdfId.set(null);
      return;
    }

    // 1. Injetamos um ID único no body para servir como nossa "marcação"
    novaAba.document.title = 'Carregando...';
    novaAba.document.body.id = 'aba-pdf-carregando'; 
    novaAba.document.body.innerHTML = '<p style="font-family:sans-serif; text-align:center; margin-top:20px;">Gerando seu PDF...</p>';

    try {
      const blob = await firstValueFrom(this.dataService.obterComprovante(id));
      const pdfBlob = blob.type === 'application/pdf' 
        ? blob 
        : new Blob([blob], { type: 'application/pdf' });
      
      const fileUrl = URL.createObjectURL(pdfBlob);
      novaAba.location.href = fileUrl;

      setTimeout(() => URL.revokeObjectURL(fileUrl), 8000);

      // 2. O Pulo do Gato: Checagem se a aba ficou "órfã" após 3 segundos
      setTimeout(() => {
        try {
          // Se a aba não foi fechada pelo usuário E o nosso ID original ainda estiver lá,
          // significa que o visualizador de PDF não assumiu a tela (IDM sequestrou).
          if (!novaAba.closed && novaAba.document.body.id === 'aba-pdf-carregando') {
            novaAba.close(); // Fecha a aba órfã silenciosamente
          }
        } catch (e) {
          // 3. Bloco Catch Vazio Intencional
          // Quando o visualizador nativo de PDF do navegador carrega, ele frequentemente
          // muda o contexto de segurança da aba. Tentar acessar "novaAba.document" 
          // vai gerar um erro de Cross-Origin (CORS). Se der erro, significa que o 
          // PDF abriu com sucesso na tela! Então não fazemos nada.
        }
      }, 3000); // 3 segundos é tempo suficiente para o navegador/IDM decidir o destino

    } catch (error) {
      if (novaAba && !novaAba.closed) {
        novaAba.close(); 
      }
      this.notificationService.error('Não foi possível gerar o comprovante.', 'Erro ao Gerar PDF');
    } finally {
      this.carregandoPdfId.set(null);
    }
  }

  async imprimirComprovante(id: number): Promise<void> {
    await this.abrirComprovante(id);
  }

  async enviarViaWhatsApp(id: number): Promise<void> {
    // Exemplo de como implementar mantendo o padrão assíncrono do componente
    try {
      this.notificationService.info('Preparando envio para o WhatsApp...', 'WhatsApp');
      // Adicione sua lógica de integração com a API do WhatsApp aqui futuramente
    } catch {
      this.notificationService.error('Falha ao disparar mensagem para o WhatsApp.', 'Erro WhatsApp');
    }
  }
}
