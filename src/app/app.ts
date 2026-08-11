import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AtmThemeService } from '@atmus/ngui';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  // Instantiate early so the saved/system theme applies before first paint.
  private readonly theme = inject(AtmThemeService);
}
