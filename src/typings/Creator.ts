export type Creator<T extends Object> = 
{
    new(...args: any[]): T;
};