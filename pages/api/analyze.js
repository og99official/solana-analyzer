const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const BASE_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tokenAddress } = req.body;
  if (!tokenAddress) {
    return res.status(400).json({ error: "Token address is required." });
  }

  try {
    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAssetTransfers",
        params: {
          limit: 1000,
          address: tokenAddress,
          type: "TOKEN"
        }
      })
    });

    const json = await response.json();
    const transfers = json.result || [];

    let tradeCount = 0;
    const walletPairs = {};

    for (const tx of transfers) {
      const sender = tx.fromUserAccount;
      const receiver = tx.toUserAccount;

      if (sender && receiver) {
        const pair = [sender, receiver].sort().join("-");
        walletPairs[pair] = (walletPairs[pair] || 0) + 1;
        tradeCount++;
      }
    }

    const washTrades = Object.values(walletPairs).filter(c => c > 3).length;
    const ratio = tradeCount > 0 ? ((washTrades / tradeCount) * 100).toFixed(2) : 0;

    res.status(200).json({
      total_trades: tradeCount,
      suspected_wash_trades: washTrades,
      wash_trade_ratio: ratio
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch from Helius API." });
  }
}
