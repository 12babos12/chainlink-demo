"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/card";
import { formatPrice } from "@/lib/utils";
import useAssetInfo from "@/hooks/useAssetInfo";
import { Button } from "@/components/button";
import Link from "next/link";
import Image from "next/image";
import { assetIcons } from "@/lib/constants";
import { Skeleton } from "@/components/skeleton";

export function AssetInfoTable() {
  const searchParams = useSearchParams();
  const selectedSymbol = searchParams.get("asset")?.toLowerCase();
  const assetInfo = useAssetInfo();

  return (
    <Card className="w-full pt-4 pb-4">
      <CardContent className="flex gap-4">
        {assetInfo.map((asset) => (
          <Button
            asChild
            key={asset.symbol}
            variant={selectedSymbol === asset.symbol ? "default" : "outline"}
            className="flex-1"
          >
            <Link href={`/dashboard?asset=${asset.symbol}`}>
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-2">
                  <Image
                    src={assetIcons[asset.symbol]}
                    alt={`${asset.name} icon`}
                    height={22}
                  />
                  <div className="flex gap-1.5 mt-px">
                    <p>{asset.name}</p>
                    <p>{asset.symbol.toUpperCase()}</p>
                  </div>
                </div>
                {asset.price ? (
                  formatPrice(asset.price)
                ) : (
                  <Skeleton className="h-4 w-[65px]" />
                )}
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
