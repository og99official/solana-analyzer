import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function VolumeAnalyzer() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeVolume = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "Failed to analyze volume." });
    } finally {
      setLoading(false);
    }
  };

  const chartData = result && !result.error ? [
    { label: "Total Trades", value: result.total_trades },
    { label: "Wash Trades", value: result.suspected_wash_trades }
  ] : [];

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Solana MemeCoin Volume Checker</h1>
      <Input
        placeholder="Enter token address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <Button onClick={analyzeVolume} disabled={loading || !tokenAddress}>
        {loading ? "Analyzing..." : "Analyze Volume"}
      </Button>

      {result && (
        <Card>
          <CardContent className="p-4">
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Total Trades:</strong> {result.total_trades}</p>
                  <p><strong>Suspected Wash Trades:</strong> {result.suspected_wash_trades}</p>
                  <p><strong>Wash Trade Ratio:</strong> {result.wash_trade_ratio}%</p>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
