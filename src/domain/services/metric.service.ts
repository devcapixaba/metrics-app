import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Metric } from '../entities/metric.entity';

@Injectable()
export class MetricService {
    constructor(
        @InjectRepository(Metric)
        private readonly metricRepository: Repository<Metric>,
    ) { }

    async saveMetrics(metrics: Metric[]): Promise<void> {
        await this.metricRepository.save(metrics);
    }

    async getAggregatedMetrics(metricId: number, aggType: string, dateInitial: Date, finalDate: Date): Promise<any[]> {
        const groupBy = this.getGroupByColumn(aggType);

        return this.metricRepository
            .createQueryBuilder('metric')
            .select(`${groupBy} as date, SUM(metric.value) as value`)
            .where('metric.metricId = :metricId', { metricId })
            .andWhere('metric.dateTime BETWEEN :dateInitial AND :finalDate', { dateInitial, finalDate })
            .groupBy(groupBy)
            .orderBy(groupBy, 'ASC')
            .getRawMany();
    }

    async getAggregatedDataToReport(metricId: number, dateInitial: string, finalDate: string) {
        const query = this.metricRepository
            .createQueryBuilder('metric')
            .select([
                'metric.metricId AS metricId',
                'metric.dateTime AS dateTime',
                "DATE_PART('day', metric.dateTime) AS aggDay",
                "DATE_PART('month', metric.dateTime) AS aggMonth",
                "DATE_PART('year', metric.dateTime) AS aggYear",
            ])
            .where('metric.metricId = :metricId', { metricId })
            .andWhere('metric.dateTime BETWEEN :dateInitial AND :finalDate', {
                dateInitial,
                finalDate,
            })
            .orderBy('metric.dateTime', 'ASC');

        return await query.getRawMany();
    }

    private getGroupByColumn(aggType: string): string {
        switch (aggType) {
            case 'DAY':
                return "DATE(metric.dateTime)";
            case 'MONTH':
                return "TO_CHAR(metric.dateTime, 'YYYY-MM')";
            case 'YEAR':
                return "TO_CHAR(metric.dateTime, 'YYYY')";
            default:
                throw new Error('Invalid aggregation type');
        }
    }
}