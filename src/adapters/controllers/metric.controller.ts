import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { MetricService } from '../../domain/services/metric.service';
import { ExcelSerializer } from '../serializers/excel.serializer';
import { Response } from 'express';
import { CsvReader } from '../read-csv';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetAggregatedMetricsDto } from '../dtos/get-aggregated-metrics.dto';
import { GenerateReportDto } from '../dtos/generate-report.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('metrics')
export class MetricController {
    constructor(
        private readonly metricService: MetricService,
        private readonly csvReader: CsvReader,
        private readonly excelSerializer: ExcelSerializer,
    ) { }

    @Post('import')
    @ApiOperation({ summary: 'Import a file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Imported file',
    })
    @UseInterceptors(FileInterceptor('file'))
    async importMetrics(@UploadedFile() file: Express.Multer.File): Promise<void> {
        if (!file) {
            throw new BadRequestException('File not sent');
        }
        await this.csvReader.readAndSaveMetrics(file.buffer);
    }

    @Get('aggregate')
    @ApiOperation({ summary: 'Get aggegate data' })
    @ApiBody({
        description: 'Payload for get a new aggregate data',
        type: GetAggregatedMetricsDto,
        schema: {
            type: 'object',
            properties: {
                metricId: { type: 'number', example: 217452 },
                aggType: { type: 'string', example: 'DAY' },
                dateInitial: { type: 'string', example: '2023-11-19' },
                finalDate: { type: 'string', example: '2023-11-23' },
            },
            required: ['metricId', 'dateInitial', 'aggType', 'finalDate'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Aggregated data',
        type: 'object',
        example: [{
            date: '2023-11-21T03:00:00.000Z',
            value: 266
        }]
    })
    async getAggregatedMetrics(@Body() body: GetAggregatedMetricsDto): Promise<any[]> {
        const { metricId, aggType, dateInitial, finalDate } = body;
        return this.metricService.getAggregatedMetrics(metricId, aggType, new Date(dateInitial), new Date(finalDate));
    }

    @Post('report')
    @ApiOperation({ summary: 'Report' })
    @ApiResponse({
        status: 201,
        description: 'Reported created successfully',
        type: 'object',
        example: {
            file: {
                type: 'string',
                format: 'binary'
            }
        }
    })
    @ApiBody({
        description: 'Payload for creating a new Report',
        type: GenerateReportDto,
        schema: {
            type: 'object',
            properties: {
                metricId: { type: 'number', example: 217452 },
                dateInitial: { type: 'string', example: '2023-11-19' },
                finalDate: { type: 'string', example: '2023-11-23' },
            },
            required: ['metricId', 'dateInitial', 'finalDate'],
        },
    })
    async generateReport(@Body() body: GenerateReportDto, @Res() res: Response): Promise<void> {
        const { metricId, dateInitial, finalDate } = body;
        const reportData = await this.metricService.getAggregatedDataToReport(metricId, dateInitial, finalDate);
        await this.excelSerializer.serializeToExcel(reportData, metricId, res);
    }
}
