import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ModeComponent } from '@shared/ui/mode.component';
import { RootRoutes } from '@root/app.routes';

@Component({
  selector: 'app-navigation',
  imports: [ModeComponent, Menubar],
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
      routerLink: `/${RootRoutes.HOME}`
    },
    {
      label: 'Auth',
      icon: 'pi pi-user',
      routerLink: `/${RootRoutes.AUTH}`
    }
  ];
}
