import { ASSETS } from "@/lib/constants";
import { DEFAULT_CACHE_TTL_SECONDS, redis } from "@/lib/redis";
import { feedRegistry } from "@/networking/chainlink/data-sources";

export async function getAssetInfo() {
  const cacheKey = "assetInfo";
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const results = await Promise.all(
    ASSETS.map(async (asset) => {
      try {
        const roundData = await feedRegistry.latestRoundData(
          asset.address,
          asset.quote
        );
        const price = Number(roundData.answer) / 10 ** asset.decimals;
        const updatedAt = new Date(Number(roundData.updatedAt) * 1000);

        return {
          symbol: asset.symbol,
          name: asset.name,
          price,
          updatedAt,
          roundId: roundData.roundId.toString(),
        };
      } catch (err) {
        console.error(`Failed to fetch price for ${asset.symbol}`, err);
        return {
          symbol: asset.symbol,
          name: asset.name,
          error: true,
        };
      }
    })
  );

  await redis.set(
    cacheKey,
    JSON.stringify(results),
    "EX",
    DEFAULT_CACHE_TTL_SECONDS
  );

  return results;
}
