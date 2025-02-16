import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '@shared/ui/navigation.component';
import { AuthService } from '@shared/data-access/auth.service';
import { ApiState } from '@shared/model/shared.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationComponent],
  template: `
    <div class="w-full xl:max-w-7xl m-auto">
      <div class="w-full mb-3 sticky top-0 z-20">
        <app-navigation />
      </div>

      <div class="w-full pb-2 px-1">
        <router-outlet />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  protected readonly state = ApiState;
  constructor(protected readonly service: AuthService) {
    // automatically retrieve active user on load of application
    this.service.user();
  }
}
