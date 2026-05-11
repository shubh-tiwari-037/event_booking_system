import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { CommonModule, StorageService, UtilsService } from '@Common';
import { appConfigFactory } from '@Config';
import { AppController } from './app.controller';
import { AppCacheInterceptor } from './app-cache.interceptor';
import { MetricsInterceptor, MetricsModule, MetricsService } from './metrics';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { RedisModule } from './redis';
import { EventModule } from './event/event.module';
import { EventbookingModule } from './eventbooking/eventbooking.module';
import { WalletModule } from './wallet/wallet.module';
import { ReportModule } from './report/report.module';
import { PaymentModule } from './payment/payment.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { SchedulerModule } from './scheduler/scheduler.module';





@Module({
  imports: [
      SchedulerModule,
     ScheduleModule.forRoot(),
    MulterModule.registerAsync({
      useFactory: (storageService: StorageService) => ({
        ...storageService.defaultMulterOptions,
      }),
      inject: [StorageService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (appConfig: ConfigType<typeof appConfigFactory>) => ({
        ttl: appConfig.cacheTtl,
      }),
      inject: [appConfigFactory.KEY],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CommonModule,
    MetricsModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    EventModule,
    EventbookingModule,
    WalletModule,
    ReportModule,
    PaymentModule,
    ReportModule
    
 
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: (
        utilsService: UtilsService,
        metricsService: MetricsService,
      ) => {
        if (utilsService.isMetricsEnabled()) {
          return new MetricsInterceptor(metricsService);
        }
      },
      inject: [UtilsService, MetricsService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AppCacheInterceptor,
    },
    SchedulerService,
  ],
})
export class AppModule {}
