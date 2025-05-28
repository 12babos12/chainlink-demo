import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import {
  getAssetInfo,
  getHistoricalAssetInfo,
} from "@/networking/chainlink/reads";

// TODO: move elsewhere
const assetInfoSchema = z.array(
  z.object({
    symbol: z.string(),
    name: z.string(),
    price: z.number().optional(),
    updatedAt: z.string().optional(),
    roundId: z.string().optional(),
    error: z.literal(true).optional(),
  })
);

export const defaultRouter = createTRPCRouter({
  getAssetInfo: publicProcedure.query(async () => {
    const result = await getAssetInfo();
    return assetInfoSchema.parse(result);
  }),

  getHistoricalAssetInfo: publicProcedure
    .input(
      z.object({
        base: z.string(),
        quote: z.string(),
        decimals: z.number(),
        range: z.enum(["1D", "1W"]).default("1D"),
      })
    )
    .query(async ({ input }) => {
      const { base, quote, decimals, range } = input;
      return getHistoricalAssetInfo(base, quote, decimals, range);
    }),
});
