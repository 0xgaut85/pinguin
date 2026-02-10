import { Request, Response } from 'express';

const BASE_RPC = 'https://mainnet.base.org';
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

async function baseRpc(method: string, params: any[] = []) {
    const res = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
}

export async function balanceRoute(req: Request, res: Response) {
    try {
        const { address } = req.params;

        if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
            res.status(400).json({ error: 'Invalid Ethereum address' });
            return;
        }

        // ETH balance
        const ethBalanceHex = await baseRpc('eth_getBalance', [address, 'latest']);
        const ethBalance = parseInt(ethBalanceHex, 16) / 1e18;

        // USDC balance (balanceOf)
        const balanceOfSelector = '0x70a08231';
        const paddedAddress = address.substring(2).toLowerCase().padStart(64, '0');
        const usdcBalanceHex = await baseRpc('eth_call', [
            { to: USDC_CONTRACT, data: `${balanceOfSelector}${paddedAddress}` },
            'latest',
        ]);
        const usdcBalance = parseInt(usdcBalanceHex, 16) / 1e6;

        res.json({
            address,
            network: 'base',
            balances: {
                ETH: ethBalance.toFixed(6),
                USDC: usdcBalance.toFixed(2),
            },
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('Balance lookup error:', err.message);
        res.status(500).json({ error: 'Failed to fetch balance', details: err.message });
    }
}
