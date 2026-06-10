import { Component } from '@angular/core';
import { ComponenteDeTestes } from "../../component/componente-de-testes/componente-de-testes";
import { HistoricoOrdemServico } from "../../component/historico-ordem-servico/historico-ordem-servico";

@Component({
  standalone: true,
  selector: 'app-historico',
  imports: [HistoricoOrdemServico],
  templateUrl: './historico.html',
  styleUrl: './historico.css',
})
export class Historico {}
