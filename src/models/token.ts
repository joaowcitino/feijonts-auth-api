export interface Token {
    id: number;
    token: string;
    discordId: string;
    clientIp: string;
    scriptName: string;
    createdAt: Date;
    expirationDate: Date;
    isExpired?: boolean;
}
