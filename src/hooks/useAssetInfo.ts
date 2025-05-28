import { ASSETS } from "@/lib/constants";
import { useTRPC } from "@/networking/trpc/client";
import { useQuery } from "@tanstack/react-query";

const fallbackAssetInfo = ASSETS.map((asset) => ({
  symbol: asset.symbol,
  name: asset.name,
  price: null,
}));

const useAssetInfo = () => {
  const trpc = useTRPC();
  const { data: assetInfo } = useQuery(
    trpc.default.getAssetInfo.queryOptions()
  );

  return assetInfo ?? fallbackAssetInfo;
};

export default useAssetInfo;
