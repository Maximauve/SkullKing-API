import {Controller, Get} from '@nestjs/common';

@Controller('')
export class HomeControllerController {
  @Get('')
  getHello(): string {
    return 'Hello World!';
  }
}
