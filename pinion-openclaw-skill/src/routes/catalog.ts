import { Request, Response } from 'express';

export function catalogRoute(payTo: string, network: string) {
    return (_req: Request, res: Response) => {
        const skills = [
            {
                endpoint: '/balance/:address',
                method: 'GET',
                price: '$0.01',
                currency: 'USDC',
                network,
                description: 'Get ETH and USDC balances for any Base address',
                example: '/balance/0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf',
            },
            {
                endpoint: '/tx/:hash',
                method: 'GET',
                price: '$0.01',
                currency: 'USDC',
                network,
                description: 'Get decoded transaction details for any Base transaction hash',
                example: '/tx/0x...',
            },
            {
                endpoint: '/price/:token',
                method: 'GET',
                price: '$0.01',
                currency: 'USDC',
                network,
                description: 'Get current USD price for ETH or other tokens',
                example: '/price/ETH',
            },
            {
                endpoint: '/wallet/generate',
                method: 'GET',
                price: '$0.01',
                currency: 'USDC',
                network,
                description: 'Generate a fresh Base wallet keypair for your OpenClaw agent',
                example: '/wallet/generate',
            },
        ];
        res.json({ skills, payTo, network });
    };
}
