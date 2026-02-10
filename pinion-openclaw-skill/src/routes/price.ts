import { Request, Response } from 'express';

const TOKEN_MAP: Record<string, string> = {
    ETH: 'ethereum',
    USDC: 'usd-coin',
    WETH: 'weth',
    CBETH: 'coinbase-wrapped-staked-eth',
    DAI: 'dai',
    USDT: 'tether',
};

export async function priceRoute(req: Request, res: Response) {
    try {
        const token = req.params.token.toUpperCase();
        const geckoId = TOKEN_MAP[token];

        if (!geckoId) {
            res.status(400).json({
                error: `Unsupported token: ${token}`,
                supported: Object.keys(TOKEN_MAP),
            });
            return;
        }

        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`,
        );
        const priceData = await priceRes.json();

        if (!priceData[geckoId]) {
            res.status(502).json({ error: 'Price data unavailable' });
            return;
        }

        res.json({
            token,
            network: 'base',
            priceUSD: priceData[geckoId].usd,
            change24h: priceData[geckoId].usd_24h_change
                ? priceData[geckoId].usd_24h_change.toFixed(2) + '%'
                : null,
            timestamp: new Date().toISOString(),
        });
    } catch (err: any) {
        console.error('Price lookup error:', err.message);
        res.status(500).json({ error: 'Failed to fetch price', details: err.message });
    }
}
