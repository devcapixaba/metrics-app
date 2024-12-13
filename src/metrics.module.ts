import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from './domain/entities/metric.entity';
import { MetricService } from './domain/services/metric.service';
import { MetricController } from './adapters/controllers/metric.controller';
import { ExcelSerializer } from './adapters/serializers/excel.serializer';
import { CsvReader } from './adapters/read-csv';

@Module({
    imports: [TypeOrmModule.forFeature([Metric])],
    controllers: [MetricController],
    providers: [MetricService, CsvReader, ExcelSerializer],
    exports: [MetricService]
})
export class MetricsModule {}
