import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString } from 'class-validator';

export class GetAggregatedMetricsDto {
    @IsInt()
    @ApiProperty({example: '217452'})
    metricId: number;

    @IsString()
    @ApiProperty({example: 'DAY'})
    aggType: string;

    @IsDateString()
    @ApiProperty({example: '2023-11-19'})
    dateInitial: string;

    @IsDateString()
    @ApiProperty({example: '2023-11-23'})
    finalDate: string;
}
