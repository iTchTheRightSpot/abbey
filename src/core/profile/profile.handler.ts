import { Router } from 'express';
import * as u from '@utils/index';
import * as c from '@core/index';

export class ProfileHandler {
  constructor(
    private readonly router: Router,
    private readonly logger: u.ILogger,
    private readonly service: c.IProfileService
  ) {
    this.register();
  }

  private readonly register = () => {};
}
