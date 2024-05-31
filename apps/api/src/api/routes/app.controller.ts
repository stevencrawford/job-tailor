import { Controller, Post } from '@nestjs/common';
import { AppService } from '../../services/app.service';

@Controller('/hello')
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Post()
  sayHello() {
    return this.appService.getData();
  }
}
