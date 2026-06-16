import { Component, inject, input, output, signal } from '@angular/core';
import { OrdemServico } from '../../services/ordem-servico';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface Produto {
  id: number;
  nome: string;
  preco: string;
  descricao: string;
}

@Component({
  selector: 'app-componente-de-testes',
  imports: [ReactiveFormsModule],
  templateUrl: './componente-de-testes.html',
  styleUrl: './componente-de-testes.css',
})
export class ComponenteDeTestes {
  itemExpandidoId = signal<number | null>(null);

  produtos = signal<Produto[]>([
    { id: 1, nome: 'Smartphone X', preco: 'R$ 2.999', descricao: 'Tela OLED de 6.7 polegadas com bateria de longa duração e carregamento rápido.' },
    { id: 2, nome: 'Notebook Pro', preco: 'R$ 5.499', descricao: 'Processador de última geração ideal para desenvolvimento de software e design gráfico.' }
  ]);

  alternarExpansao(id: number): void {
    this.itemExpandidoId.update(idAtual => idAtual === id ? null : id);
  }


  private readonly dataService = inject(OrdemServico); // Injeção do serviço de dados para comunicação com a API
  baixarPDF(): void{
    this.dataService.gerarPDF().subscribe({
      next: (response: Blob) => {
        // 1. Garante que o navegador interprete o binário como PDF
        const file = new Blob([response], { type: 'application/pdf' });
        
        // 2. Cria a URL segura do objeto
        const fileURL = window.URL.createObjectURL(file);
        
        // 3. Abre em uma nova aba do navegador para visualização/impressão
        window.open(fileURL, '_blank');
        
        // Nota: Não limpe com revokeObjectURL imediatamente se for abrir em nova aba, 
        // pois o navegador precisa da URL ativa para renderizar a página.
      },
      error: (err) => {
        console.error('Erro ao buscar o PDF:', err);
      }
    });
  }

   // Inputs usando Signals para receber valores do componente pai
  labelBotao = input<string>('Enviar');
  dadosIniciais = input<{ nome: string; email: string }>({ nome: '', email: '' });

  // Output usando a nova função output() para emitir o resultado
  formSubmetido = output<{ nome: string; email: string }>();

  // Criação do formulário reativo
  formulario = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] })
  });

  // ngOnInit clássico ou construtor para preencher o formulário se houver dados iniciais
  constructor() {
    // Efeito para atualizar o form caso os dadosIniciais mudem externamente
    // O Angular garante a execução segura no ciclo correto
    const dados = this.dadosIniciais();
    if (dados) {
      this.formulario.setValue(dados);
    }
  }

  aoSubmeter() {
    if (this.formulario.valid) {
      // Emite o valor cru do formulário para o componente pai inteligente
      this.formSubmetido.emit(this.formulario.getRawValue());
    }
  }



}
