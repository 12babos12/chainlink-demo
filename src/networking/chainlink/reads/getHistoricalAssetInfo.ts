import { DEFAULT_CACHE_TTL_SECONDS, redis } from "@/lib/redis";
import { feedRegistry } from "@/networking/chainlink/data-sources";

const MASK_64 = BigInt("0xFFFFFFFFFFFFFFFF");

export type RoundResult = {
  price: number;
  updatedAt: number;
};

export async function getHistoricalAssetInfo(
  base: string,
  quote: string,
  decimals: number,
  range: "1D" | "1W" = "1D"
): Promise<RoundResult[]> {
  const cacheKey = `historicalAssetInfo:${base}:${quote}:${range}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  const results: RoundResult[] = [];

  const now = Date.now() / 1000; // current time in seconds
  const cutoff = range === "1D" ? now - 60 * 60 * 24 : now - 60 * 60 * 24 * 7; // 1 day or 1 week ago

  const currentPhaseId = BigInt(
    await feedRegistry.getCurrentPhaseId(base, quote)
  );
  let phase = currentPhaseId;
  let done = false;

  while (phase > 0n && !done) {
    try {
      const { startingRoundId, endingRoundId } =
        await feedRegistry.getPhaseRange(base, quote, phase);

      const start = startingRoundId & MASK_64;
      let i = endingRoundId & MASK_64;

      while (i >= start) {
        const roundId = (phase << 64n) | i;

        try {
          const roundData = await feedRegistry.getRoundData(
            base,
            quote,
            roundId.toString()
          );

          const updatedAt = Number(roundData.updatedAt);

          results.push({
            price: Number(roundData.answer) / 10 ** decimals,
            updatedAt: updatedAt * 1000,
          });

          if (updatedAt <= cutoff) {
            done = true;
            break; // break inner loop
          }

          i -= 1n;
        } catch (err) {
          console.warn(`Failed at round ${roundId.toString()}:`, err);
          break;
        }
      }
    } catch (phaseErr) {
      console.warn(`Skipping phase ${phase}:`, phaseErr);
    }

    phase -= 1n;
  }

  const orderedResults = results.reverse();
  await redis.set(
    cacheKey,
    JSON.stringify(orderedResults),
    "EX",
    DEFAULT_CACHE_TTL_SECONDS
  );

  return orderedResults;
}
