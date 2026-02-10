import { Request, Response } from 'express';

const BASE_RPC = 'https://mainnet.base.org';

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

export async function txRoute(req: Request, res: Response) {
    try {
        const { hash } = req.params;

        if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
            res.status(400).json({ error: 'Invalid transaction hash' });
            return;
        }

        const tx = await baseRpc('eth_getTransactionByHash', [hash]);
        if (!tx) {
            res.status(404).json({ error: 'Transaction not found' });
            return;
        }

        const receipt = await baseRpc('eth_getTransactionReceipt', [hash]);

        res.json({
            hash: tx.hash,
            network: 'base',
            from: tx.from,
            to: tx.to,
            value: (parseInt(tx.value, 16) / 1e18).toFixed(6) + ' ETH',
            gasUsed: receipt ? parseInt(receipt.gasUsed, 16).toString() : 'pending',
            status: receipt ? (receipt.status === '0x1' ? 'success' : 'reverted') : 'pending',
            blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('Tx lookup error:', err.message);
        res.status(500).json({ error: 'Failed to fetch transaction', details: err.message });
    }
}
