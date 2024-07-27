export type Tokens = {
    consumer: string;
    producer: string;
};
export const tokens: Tokens = {
    consumer: 'consumer',
    producer: 'producer',
} as const;
