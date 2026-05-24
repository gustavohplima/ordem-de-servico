import { Component, signal } from '@angular/core';

interface Produto {
  id: number;
  nome: string;
  preco: string;
  descricao: string;
}

@Component({
  selector: 'app-componente-de-testes',
  imports: [],
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
}
