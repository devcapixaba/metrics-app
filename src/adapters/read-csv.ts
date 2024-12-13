import { Injectable } from '@nestjs/common';
import * as csvParser from 'csv-parser';
import { Metric } from 'src/domain/entities/metric.entity';
import { MetricService } from 'src/domain/services/metric.service';
import { Readable } from 'stream';
import { parse } from 'date-fns';

@Injectable()
export class CsvReader {
    constructor(private readonly metricService: MetricService) { }

    async readAndSaveMetrics(buffer: Buffer): Promise<void> {
        const metrics: Metric[] = [];
        const stream = Readable.from(buffer.toString('utf-8'));

        return new Promise((resolve, reject) => {
            stream
                .pipe(csvParser({ separator: ';', mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '') }))
                .on('data', (row) => {
                    const date = parse(row.dateTime, 'dd/MM/yyyy HH:mm', new Date());
                    metrics.push({
                        metricId: Number(row.metricId),
                        dateTime: date,
                        value: parseFloat(row.value),
                    } as Metric);
                })
                .on('end', async () => {
                    const batchSize = 1000;
                    await metrics.reduce(async (prevPromise, _, index) => {
                        await prevPromise;
                    
                        if (index % batchSize === 0) {
                            const batch = metrics.slice(index, index + batchSize);
                            await this.metricService.saveMetrics(batch);
                            console.log(`Lote ${index / batchSize + 1} salvo com sucesso`);
                        }
                    }, Promise.resolve());
                    resolve();
                })
                .on('error', (error) => reject(error));
        });
    }
}
