import { Asset } from "@/lib/constants";
import { useTRPC } from "@/networking/trpc/client";
import { useQuery } from "@tanstack/react-query";

const useHistoricalAssetInfo = (selectedAsset: Asset) => {
  const trpc = useTRPC();
  const { data: historicalAssetInfo } = useQuery(
    trpc.default.getHistoricalAssetInfo.queryOptions(
      {
        base: selectedAsset!.address,
        quote: selectedAsset!.quote,
        decimals: selectedAsset!.decimals,
      },
      {
        enabled: !!selectedAsset,
      }
    )
  );

  return historicalAssetInfo ?? [];
};

export default useHistoricalAssetInfo;
