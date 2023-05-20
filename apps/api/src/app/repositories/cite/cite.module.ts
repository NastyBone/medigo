import { Module } from '@nestjs/common';
import { CiteService } from './cite.service';
import { CiteController } from './cite.controller';
import { Cite } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthModule } from '../../auth/jwt-auth/jwtAuth.module';
import { UsersModule } from '../users';
import { CronModule } from '../../cron/cron.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cite]),
    UsersModule,
    JwtAuthModule,
    CronModule,
  ],
  providers: [CiteService],
  controllers: [CiteController],
  exports: [CiteService],
})
export class CiteModule {}
