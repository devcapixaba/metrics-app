import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('metrics')
export class Metric {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    metricId: number;

    @Column()
    dateTime: Date;

    @Column('float')
    value: number;
}