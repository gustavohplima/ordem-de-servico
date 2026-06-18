import { Component } from '@angular/core';
import { PageForm } from '../../component/page-form/page-form';
import { ListHistoricoPage } from '../../component/list-historico-pendentes/list-historico-page';
import { ServicosEntregues } from '../../component/servicos-entregues/servicos-entregues';
import { ListModel } from "../../component/dumbComponents/list-model/list-model";
import { FormModel } from "../../component/dumbComponents/form-model/form-model";
import { ComponenteDeTestes } from "../../component/componente-de-testes/componente-de-testes";
import { Edicao } from '../../component/edicao/edicao';

@Component({
  standalone: true,
  selector: 'app-atendimento',
  imports: [PageForm, ListHistoricoPage, Edicao],
  templateUrl: './atendimento.html',
  styleUrl: './atendimento.css',
})
export class Atendimento {}
