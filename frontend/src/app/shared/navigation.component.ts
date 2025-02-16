import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CoreRoutes } from '../app.routes';
import { ModeComponent } from './mode.component';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-navigation',
  imports: [
    ModeComponent,
    Menubar
  ],
  template: `
    <div class="w-full">
      <p-menubar [model]="items">
        <ng-template #end>
            <app-mode />
        </ng-template>
      </p-menubar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent {
  protected readonly items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: `/${CoreRoutes.HOME}`
    },
    {
      label: 'Auth',
      icon: 'pi pi-user',
      routerLink: `/${CoreRoutes.AUTH}`
    }
  ];
}
