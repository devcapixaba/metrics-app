import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Metric } from 'src/domain/entities/metric.entity';
import { MetricService } from 'src/domain/services/metric.service';
import { Repository } from 'typeorm';

describe('MetricService', () => {
  let service: MetricService;
  let repository: Repository<Metric>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricService,
        {
          provide: getRepositoryToken(Metric),
          useValue: {
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<MetricService>(MetricService);
    repository = module.get<Repository<Metric>>(getRepositoryToken(Metric));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveMetrics', () => {
    it('should save metrics', async () => {
      const metrics = [{ metricId: 1, value: 100, dateTime: new Date() }] as Metric[];

      await service.saveMetrics(metrics);

      expect(repository.save).toHaveBeenCalledWith(metrics);
    });
  });

  describe('getAggregatedMetrics', () => {
    it('should return aggregated metrics data', async () => {
      const metricId = 1;
      const aggType = 'DAY';
      const dateInitial = new Date('2024-01-01');
      const finalDate = new Date('2024-01-02');

      const mockData = [{ date: '2024-01-01', value: 100 }];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockData);

      const result = await service.getAggregatedMetrics(metricId, aggType, dateInitial, finalDate);

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('DATE(metric.dateTime) as date, SUM(metric.value) as value');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('metric.metricId = :metricId', { metricId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('metric.dateTime BETWEEN :dateInitial AND :finalDate', { dateInitial, finalDate });
      expect(result).toEqual(mockData);
    });

    it('should throw error for invalid aggregation type', async () => {
      await expect(service.getAggregatedMetrics(1, 'INVALID', new Date(), new Date()))
        .rejects
        .toThrowError('Invalid aggregation type');
    });
  });

  describe('getAggregatedDataToReport', () => {
    it('should return aggregated data for the report', async () => {
      const metricId = 1;
      const dateInitial = '2024-01-01';
      const finalDate = '2024-01-02';

      const mockData = [
        { metricId: 1, dateTime: '2024-01-01', aggDay: 1, aggMonth: 1, aggYear: 2024 },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(mockData);

      const result = await service.getAggregatedDataToReport(metricId, dateInitial, finalDate);

      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'metric.metricId AS metricId',
        'metric.dateTime AS dateTime',
        "DATE_PART('day', metric.dateTime) AS aggDay",
        "DATE_PART('month', metric.dateTime) AS aggMonth",
        "DATE_PART('year', metric.dateTime) AS aggYear",
      ]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('metric.metricId = :metricId', { metricId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('metric.dateTime BETWEEN :dateInitial AND :finalDate', { dateInitial, finalDate });
      expect(result).toEqual(mockData);
    });
  });
});
