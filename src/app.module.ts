import { Module } from '@nestjs/common';
import { MetricsModule } from './metrics.module';
import { TypeOrmConfig } from './infra/db/typeorm-config';

@Module({
    imports: [
        TypeOrmConfig,
        MetricsModule
    ],
})
export class AppModule {}
