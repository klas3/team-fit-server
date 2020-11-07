import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import AuthModule from '../auth/auth.module';
import EmailModule from '../email/email.module';
import PartyModule from '../party/party.module';
import UserModule from '../user/user.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../shared'),
      exclude: ['index.html'],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: false,
      entities: ['dist/entity/**/*.js'],
      migrations: ['./dist/migration/*.js'],
      subscribers: ['dist/subscriber/**/*.js'],
      cli: {
        entitiesDir: 'src/entity',
        migrationsDir: './src/migration',
        subscribersDir: 'src/subscriber',
      },
    }),
    UserModule,
    PartyModule,
    EmailModule,
    AuthModule,
  ],
})
class AppModule {}

export default AppModule;
