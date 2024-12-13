import { TypeOrmModule } from '@nestjs/typeorm';
import { Metric } from '../../domain/entities/metric.entity';

export const TypeOrmConfig = TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '123456',
    database: 'metrics',
    entities: [Metric],
    synchronize: true,
});