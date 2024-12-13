import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDateString } from 'class-validator';

export class GenerateReportDto {
    @IsInt()
    @ApiProperty({ example: 217452 })
    metricId: number;

    @IsDateString()
    @ApiProperty({ example: '2023-11-19' })
    dateInitial: string;

    @IsDateString()
    @ApiProperty({ example: '2023-11-23' })
    finalDate: string;
}
