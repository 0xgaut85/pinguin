import { Request, Response } from 'express';
import { ethers } from 'ethers';

const BASE_RPC = 'https://mainnet.base.org';
const BASE_CHAIN_ID = 8453;

export async function broadcastRoute(req: Request, res: Response) {
    try {
        const { tx, privateKey } = req.body;

        if (!tx || !privateKey) {
            res.status(400).json({ error: 'Missing required fields: tx, privateKey' });
            return;
        }

        if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
            res.status(400).json({ error: 'Invalid private key format (expected 0x + 64 hex chars)' });
            return;
        }

        if (!tx.to || !tx.chainId) {
            res.status(400).json({ error: 'tx must include at least: to, chainId' });
            return;
        }

        if (tx.chainId !== BASE_CHAIN_ID) {
            res.status(400).json({ error: `Only Base mainnet supported (chainId ${BASE_CHAIN_ID})` });
            return;
        }

        const provider = new ethers.JsonRpcProvider(BASE_RPC, BASE_CHAIN_ID);
        const wallet = new ethers.Wallet(privateKey, provider);

        const txRequest: ethers.TransactionRequest = {
            to: tx.to,
            value: tx.value || '0x0',
            data: tx.data || '0x',
            chainId: BASE_CHAIN_ID,
        };

        // If gas fields are provided, use them; otherwise let ethers estimate
        if (tx.gasLimit) txRequest.gasLimit = tx.gasLimit;
        if (tx.maxFeePerGas) txRequest.maxFeePerGas = tx.maxFeePerGas;
        if (tx.maxPriorityFeePerGas) txRequest.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;

        const sentTx = await wallet.sendTransaction(txRequest);

        res.json({
            txHash: sentTx.hash,
            explorerUrl: `https://basescan.org/tx/${sentTx.hash}`,
            from: wallet.address,
            to: tx.to,
            network: 'base',
            status: 'submitted',
            note: 'Transaction submitted to Base. It may take a few seconds to confirm.',
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('Broadcast error:', err.message);

        let userMessage = 'Failed to sign and broadcast transaction';
        if (err.message?.includes('insufficient funds')) {
            userMessage = 'Insufficient ETH for gas fees';
        } else if (err.message?.includes('nonce')) {
            userMessage = 'Nonce conflict -- a pending transaction may be stuck';
        } else if (err.message?.includes('invalid private key')) {
            userMessage = 'Invalid private key';
        }

        res.status(500).json({ error: userMessage, details: err.message });
    }
}
