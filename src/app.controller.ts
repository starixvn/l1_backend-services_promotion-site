import { Get, Controller, Render } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    @Render('index')
    root() {
        const jsonObject = {
            message: 'Hello from Promotion Site!',
            date: Date.toString(),
            subPath: process.env.SUB_PATH
        }

        return { jsonObject: JSON.stringify(jsonObject) };
    }
}
