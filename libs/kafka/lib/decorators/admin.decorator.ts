import { Inject } from '@nestjs/common';

export const InjectKafkaAdmin = () => {
    return Inject('kafka:admin');
};