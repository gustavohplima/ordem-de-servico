import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Formulario } from '../../model/ordem-de-servico';

@Component({
  selector: 'app-edicao',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe],
  templateUrl: './edicao.html',
  styleUrl: './edicao.css',
})
export class Edicao {
  @Input() ordem!: Formulario;
  @Output() salvar = new EventEmitter<Formulario>();
  @Output() cancelar = new EventEmitter<void>();

  copiaOrdem: Formulario | null = null;

  ngOnChanges(): void {
    if (this.ordem) {
      this.copiaOrdem = {
        ...this.ordem,
        dataHora: this.ordem.dataHora ? new Date(this.ordem.dataHora) : new Date(),
      };
    }
  }

  salvarAlteracoes(): void {
    if (!this.copiaOrdem) {
      return;
    }

    const ordemParaSalvar: Formulario = {
      ...this.copiaOrdem,
      modelo: this.copiaOrdem.modelo?.trim().toUpperCase() ?? '',
      dataHora: this.copiaOrdem.dataHora ? new Date(this.copiaOrdem.dataHora) : new Date(),
    };

    this.salvar.emit(ordemParaSalvar);
  }

  cancelarEdicao(): void {
    this.cancelar.emit();
  }
}
