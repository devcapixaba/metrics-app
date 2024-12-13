import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { MetricController } from 'src/adapters/controllers/metric.controller';
import { MetricService } from 'src/domain/services/metric.service';
import { CsvReader } from 'src/adapters/read-csv';
import { ExcelSerializer } from 'src/adapters/serializers/excel.serializer';

describe('MetricController', () => {
    let controller: MetricController;
    let service: MetricService;
    let csvReader: CsvReader;
    let excelSerializer: ExcelSerializer;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MetricController],
            providers: [
                {
                    provide: MetricService,
                    useValue: {
                        getAggregatedMetrics: jest.fn(),
                        getAggregatedDataToReport: jest.fn(),
                    },
                },
                {
                    provide: CsvReader,
                    useValue: {
                        readAndSaveMetrics: jest.fn(),
                    },
                },
                {
                    provide: ExcelSerializer,
                    useValue: {
                        serializeToExcel: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<MetricController>(MetricController);
        service = module.get<MetricService>(MetricService);
        csvReader = module.get<CsvReader>(CsvReader);
        excelSerializer = module.get<ExcelSerializer>(ExcelSerializer);
    });

    describe('importMetrics', () => {
        it('should throw an error if no file is uploaded', async () => {
            await expect(controller.importMetrics(null)).rejects.toThrow(
                new BadRequestException('Arquivo não enviado'),
            );
        });

        it('should process the uploaded file', async () => {
            const mockFile = { buffer: Buffer.from('mock data') } as Express.Multer.File;
            await controller.importMetrics(mockFile);
            expect(csvReader.readAndSaveMetrics).toHaveBeenCalledWith(mockFile.buffer);
        });
    });

    describe('getAggregatedMetrics', () => {
        it('should return aggregated metrics', async () => {
            const mockBody = {
                metricId: 1,
                aggType: 'daily',
                dateInitial: '2023-11-01',
                finalDate: '2023-12-01',
            };
            const mockResult = [{ metricId: 1, aggValue: 100 }];
            jest.spyOn(service, 'getAggregatedMetrics').mockResolvedValue(mockResult);

            const result = await controller.getAggregatedMetrics(mockBody);
            expect(service.getAggregatedMetrics).toHaveBeenCalledWith(
                mockBody.metricId,
                mockBody.aggType,
                new Date(mockBody.dateInitial),
                new Date(mockBody.finalDate),
            );
            expect(result).toEqual(mockResult);
        });
    });

    describe('generateReport', () => {
        it('should generate an Excel report', async () => {
            const mockBody = {
                metricId: 1,
                dateInitial: '2023-11-01',
                finalDate: '2023-12-01',
            };
            const mockReportData = [{ metricId: 1, timestamp: '2023-11-01', value: 123.45 }];
            const mockResponse = {
                setHeader: jest.fn(),
                end: jest.fn(),
            } as unknown as Response;

            jest.spyOn(service, 'getAggregatedDataToReport').mockResolvedValue(mockReportData);
            jest.spyOn(excelSerializer, 'serializeToExcel').mockResolvedValue();

            await controller.generateReport(mockBody, mockResponse);

            expect(service.getAggregatedDataToReport).toHaveBeenCalledWith(
                mockBody.metricId,
                mockBody.dateInitial,
                mockBody.finalDate,
            );
            expect(excelSerializer.serializeToExcel).toHaveBeenCalledWith(
                mockReportData,
                mockBody.metricId,
                mockResponse,
            );
        });
    });
});
