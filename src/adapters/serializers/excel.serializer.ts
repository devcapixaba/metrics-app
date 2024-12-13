import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ExcelSerializer {
    async serializeToExcel(reportData: any[], metricId: number, res: Response): Promise<void> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Metrics Report');

        worksheet.columns = [
            { header: 'metricId', key: 'metricId', width: 15 },
            { header: 'dateTime', key: 'dateTime', width: 20 },
            { header: 'aggDay', key: 'aggDay', width: 15 },
            { header: 'aggMonth', key: 'aggMonth', width: 15 },
            { header: 'aggYear', key: 'aggYear', width: 15 },
        ];

        reportData.forEach(row => {
            worksheet.addRow({
                metricId: row.metricid,
                dateTime: row.datetime,
                aggDay: row.aggday,
                aggMonth: row.aggmonth,
                aggYear: row.aggyear,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="metrics_report_${metricId}.xlsx"`);

        const buffer = await workbook.xlsx.writeBuffer();
        res.end(buffer);
    }
}