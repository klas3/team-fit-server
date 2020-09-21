import { UseGuards, createParamDecorator } from '@nestjs/common';
import JwtAuthGuard from './jwr-auth.guard';

export const Authorize = () => UseGuards(JwtAuthGuard);
export const GetUser = createParamDecorator((data, req) => req.args[0].user);
