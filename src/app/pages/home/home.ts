import { Component } from '@angular/core';
import { ComponenteDeTestes } from '../../component/componente-de-testes/componente-de-testes';
import { HistoricoOrdemServico } from '../../component/historico-ordem-servico/historico-ordem-servico';


@Component({
  standalone: true,
  selector: 'app-home',
  imports: [HistoricoOrdemServico, ComponenteDeTestes],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
