import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {

  @Get()
  public async getHealth() {
    return {
      status: 'OK',
    };
  }
}
