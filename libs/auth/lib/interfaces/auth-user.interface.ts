export interface IAuthUser {
    id: string;
    role: 'admin' | 'user';
    email: string;
}