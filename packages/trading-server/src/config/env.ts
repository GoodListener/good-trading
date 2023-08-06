import { Module } from '@nestjs/common';
// @ts-ignore
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전체적으로 사용하기 위해
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export default class EnvModule {}
