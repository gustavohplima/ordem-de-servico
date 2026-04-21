import { Component, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Menu } from './component/menu/menu';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [MatIconModule, Menu, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('front-end-services');
  readonly exibir = signal(true);

  toggleMenu(): void {
    this.exibir.update((value) => !value);
  }
}
