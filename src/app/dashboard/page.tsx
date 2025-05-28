import { AssetInfoTable } from "./_page-components/AssetInfoTable";
import { HistoricalAssetInfoChart } from "./_page-components/HistoricalAssetInfoChart";
import { getQueryClient, HydrateClient, trpc } from "@/networking/trpc/server";
import { notFound, redirect } from "next/navigation";
import { assetIcons, ASSETS } from "@/lib/constants";
import Image from "next/image";

export default async function DashboardPage(dashboardProps: {
  searchParams?: Promise<{
    asset?: string;
  }>;
}) {
  const searchParams = await dashboardProps.searchParams;
  const assetSymbolFromParams = searchParams?.asset;
  if (!assetSymbolFromParams) redirect(`/dashboard?asset=${ASSETS[0].symbol}`);
  const selectedAsset = ASSETS.find(
    (asset) => asset.symbol === assetSymbolFromParams
  );
  if (!selectedAsset) notFound();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.default.getAssetInfo.queryOptions());
  void queryClient.prefetchQuery(
    trpc.default.getHistoricalAssetInfo.queryOptions({
      base: selectedAsset.address,
      quote: selectedAsset.quote,
      decimals: selectedAsset.decimals,
      range: "1D",
    })
  );

  return (
    <HydrateClient>
      <main className="flex flex-col items-center gap-4 ml-auto mr-auto mt-20 w-200">
        <div className="flex items-center gap-4 mb-10">
          <Image src={assetIcons["link"]} alt="Chainlink icon" height={40} />
          <h1 className="text-4xl mb-[3px]">Chainlink Demo</h1>
        </div>
        <AssetInfoTable />
        <HistoricalAssetInfoChart selectedAsset={selectedAsset} />
      </main>
    </HydrateClient>
  );
}
