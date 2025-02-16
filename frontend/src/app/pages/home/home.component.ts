import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Button } from 'primeng/button';
import { RootRoutes } from '@root/app.routes';
import { HomeRoutes } from '@home/home.routes';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, Button],
  template: `
    <div class="w-full p-2 flex gap-3">
      <p-button label="Account" (onClick)="route(home.ACCOUNT)" />
      <p-button label="Social" (onClick)="route(home.SOCIAL)" />
    </div>
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly router = inject(Router);
  protected readonly home = HomeRoutes;
  protected readonly route = async (r: string) =>
    await this.router.navigate([`/${RootRoutes.HOME}/${r}`]);
}
