import { Request, Response } from 'express';
import { randomBytes, createECDH } from 'crypto';
import { keccak_256 } from '@noble/hashes/sha3';

export async function walletRoute(_req: Request, res: Response) {
    try {
        // Generate a cryptographically secure private key
        const privKey = randomBytes(32);

        // Derive public key using secp256k1
        const ecdh = createECDH('secp256k1');
        ecdh.setPrivateKey(privKey);
        const pubKeyUncompressed = Buffer.from(
            ecdh.getPublicKey('hex', 'uncompressed').slice(2), // remove 04 prefix
            'hex',
        );

        // Keccak-256 hash, take last 20 bytes as address
        const hash = keccak_256(pubKeyUncompressed);
        const address = '0x' + Buffer.from(hash).slice(-20).toString('hex');

        res.json({
            address,
            privateKey: '0x' + privKey.toString('hex'),
            network: 'base',
            chainId: 8453,
            note: 'Fund this wallet with ETH for gas and USDC for x402 payments. Keep the private key safe.',
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('Wallet generation error:', err.message);
        res.status(500).json({ error: 'Failed to generate wallet', details: err.message });
    }
}
