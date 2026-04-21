import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OrdemServico } from '../../services/ordem-servico';
import { Formulario, OrdemServicoRequest } from '../../model/ordem-de-servico';

interface PageFormValue {
  nome: string;
  cpf: string;
  marca: string;
  modelo: string;
  defeito: string;
  cor: string;
  nSerieOuImei: string;
  valor: number;
  formaPagamento: string;
  contato: string;
  observacao: string;
  status: Formulario['status'];
  dataHora: Date;
}

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-page-form',
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './page-form.html',
  styleUrl: './page-form.css',
})
export class PageForm {
  private readonly ordemServico = inject(OrdemServico);

  readonly formulario = new FormGroup<{
    nome: FormControl<string>;
    cpf: FormControl<string>;
    marca: FormControl<string>;
    modelo: FormControl<string>;
    defeito: FormControl<string>;
    cor: FormControl<string>;
    nSerieOuImei: FormControl<string>;
    valor: FormControl<number>;
    formaPagamento: FormControl<string>;
    contato: FormControl<string>;
    observacao: FormControl<string>;
    status: FormControl<Formulario['status']>;
    dataHora: FormControl<Date>;
  }>({
    nome: new FormControl<string>('', { nonNullable: true }),
    cpf: new FormControl<string>('', { nonNullable: true }),
    marca: new FormControl<string>('', { nonNullable: true }),
    modelo: new FormControl<string>('', { nonNullable: true }),
    defeito: new FormControl<string>('', { nonNullable: true }),
    cor: new FormControl<string>('', { nonNullable: true }),
    nSerieOuImei: new FormControl<string>('', { nonNullable: true }),
    valor: new FormControl<number>(0, { nonNullable: true }),
    formaPagamento: new FormControl<string>('Não informado', { nonNullable: true }),
    contato: new FormControl<string>('', { nonNullable: true }),
    observacao: new FormControl<string>('', { nonNullable: true }),
    status: new FormControl<Formulario['status']>('Pendente', { nonNullable: true }),
    dataHora: new FormControl<Date>(new Date(), { nonNullable: true }),
  });

  onSubmit(): void {
    if (!this.formulario.valid) {
      return;
    }

    const formValue = this.formulario.value as PageFormValue;
    const payload: OrdemServicoRequest = {
      nome: formValue.nome,
      cpf: formValue.cpf,
      marca: formValue.marca,
      modelo: formValue.modelo,
      defeito: formValue.defeito,
      cor: formValue.cor,
      imei_nserie: formValue.nSerieOuImei,
      valor: formValue.valor,
      forma_pagamento: formValue.formaPagamento,
      contato: formValue.contato,
      observacao: formValue.observacao,
      statusText: formValue.status,
      dataHora: formValue.dataHora,
    };

    this.ordemServico.salvarFormulario(payload).subscribe({
      next: () => {
        this.ordemServico.recarregar();
        this.formulario.reset({
          nome: '',
          cpf: '',
          marca: '',
          modelo: '',
          defeito: '',
          cor: '',
          nSerieOuImei: '',
          valor: 0,
          formaPagamento: 'Não informado',
          contato: '',
          observacao: '',
          status: 'Pendente',
          dataHora: new Date(),
        });
      },
      error: (err) => {
        console.error('Erro ao salvar:', err);
      },
    });
  }
}
