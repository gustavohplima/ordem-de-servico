import { Component } from '@angular/core';
import { HistoricoOrdemServico } from "../../component/historico-ordem-servico/historico-ordem-servico";
import { Filtros } from '../../component/filtros/filtros';
import { ComponenteDeTestes } from '../../component/componente-de-testes/componente-de-testes';

@Component({
  standalone: true,
  selector: 'app-historico',
  imports: [HistoricoOrdemServico, Filtros, ComponenteDeTestes],
  templateUrl: './historico.html',
  styleUrl: './historico.css',
})
export class Historico {}
