"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/chart";
import { formatPrice } from "@/lib/utils";
import useHistoricalAssetInfo from "@/hooks/useHistoricalAssetInfo";
import { Asset } from "@/lib/constants";
import VerifiableDataIcon from "@/images/verifiable-data-icon.svg";
import Image from "next/image";
import { Skeleton } from "@/components/skeleton";

function getHourlyTicks(startOfRange: number, endOfRange: number) {
  const startDate = new Date(startOfRange);
  startDate.setMinutes(0, 0, 0);

  const ticks: number[] = [];
  let t = startDate.getTime();

  while (t <= endOfRange) {
    ticks.push(t);
    t += 60 * 60 * 1000;
  }

  return ticks;
}

function calculateHourlySMA(
  data: { updatedAt: number; price?: number }[],
  windowHours = 10
): { updatedAt: number; sma: number }[] {
  const result: { updatedAt: number; sma: number }[] = [];

  // Preprocess: group points into hourly buckets
  const buckets = new Map<number, number[]>();

  for (const d of data) {
    const hourTs = new Date(d.updatedAt);
    hourTs.setMinutes(0, 0, 0); // round down to full hour
    const bucketTime = hourTs.getTime();

    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, []);
    }
    buckets.get(bucketTime)!.push(d.price ?? 0);
  }

  // Precompute hourly averages
  const hourlyAverages = new Map<number, number>();
  for (const [hour, values] of buckets) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    hourlyAverages.set(hour, avg);
  }

  // For each datapoint, compute SMA from the last 10 hourly averages
  for (const d of data) {
    const currentHour = new Date(d.updatedAt);
    currentHour.setMinutes(0, 0, 0);
    const currentTs = currentHour.getTime();

    const hourlyValues: number[] = [];

    for (let i = 0; i < windowHours; i++) {
      const offset = currentTs - i * 60 * 60 * 1000;
      const avg = hourlyAverages.get(offset);
      if (avg !== undefined) {
        hourlyValues.push(avg);
      }
    }

    if (hourlyValues.length === windowHours) {
      const sma = hourlyValues.reduce((sum, v) => sum + v, 0) / windowHours;

      result.push({
        updatedAt: d.updatedAt,
        sma,
      });
    }
  }

  return result;
}

export function HistoricalAssetInfoChart({
  selectedAsset,
}: {
  selectedAsset: Asset;
}) {
  const historicalAssetInfo = useHistoricalAssetInfo(selectedAsset);

  const chartConfig = {
    price: {
      label: selectedAsset.symbol.toUpperCase(),
      color: "hsl(var(--chart-1))",
    },
    sma: {
      label: "10h SMA",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const lastUpdate = historicalAssetInfo.length
    ? historicalAssetInfo[historicalAssetInfo.length - 1]
    : null;

  const startOfRange = Math.min(...historicalAssetInfo.map((d) => d.updatedAt));
  const endOfRange = Math.max(...historicalAssetInfo.map((d) => d.updatedAt));
  const hourlyTicks = getHourlyTicks(startOfRange, endOfRange);

  const smaData = calculateHourlySMA(historicalAssetInfo);
  const smaMap = new Map(smaData.map((d) => [d.updatedAt, d.sma]));
  const mergedData = historicalAssetInfo.map((d) => ({
    ...d,
    sma: smaMap.get(d.updatedAt),
  }));
  const isTrendingUp =
    Number(mergedData[0]?.price) <=
    Number(mergedData[mergedData.length - 1]?.price);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl gap-2.5 items-center">
          <h1>{selectedAsset.symbol.toUpperCase()}/USD</h1>
          {lastUpdate?.price ? (
            <h1>{formatPrice(lastUpdate.price)}</h1>
          ) : (
            <Skeleton className="h-5 w-[90px] mt-[4px]" />
          )}

          {historicalAssetInfo.length ? (
            isTrendingUp ? (
              <TrendingUp className="h-7 w-7 text-green-500 mt-[5px]" />
            ) : (
              <TrendingDown className="h-7 w-7 text-red-500 mt-[5px]" />
            )
          ) : (
            <Skeleton className="h-5 w-[28px] mt-[4px]" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {historicalAssetInfo.length ? (
          <ChartContainer config={chartConfig}>
            <LineChart
              data={mergedData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="updatedAt"
                type="number"
                scale="time"
                domain={[startOfRange, endOfRange]}
                ticks={hourlyTicks}
                tickMargin={8}
                tickFormatter={(t) =>
                  new Date(t).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    hour12: true,
                  })
                }
              />
              <YAxis
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(price) => formatPrice(price)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const fallbackTime = payload?.[0]?.payload?.updatedAt;
                      return fallbackTime ? (
                        new Date(fallbackTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      ) : (
                        <Skeleton className="h-4 w-[200px]" />
                      );
                    }}
                  />
                }
              />
              <Line
                dataKey="sma"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
              <Line
                dataKey="price"
                type="linear"
                stroke={
                  isTrendingUp ? "var(--color-chart-2)" : "var(--color-chart-5)"
                }
                strokeWidth={4}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="w-[750px] h-[422px] flex items-center justify-center">
            <span className="w-12 h-12 rounded-full inline-block border-t-4 border-r-4 border-white border-r-transparent box-border animate-spin" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 text-lg leading-none justify-between w-full items-center">
          <div className="flex gap-2">
            <p>Last update:</p>
            {lastUpdate?.updatedAt ? (
              <p>
                {new Date(lastUpdate.updatedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ) : (
              <Skeleton className="h-5 w-[74px] mt-px" />
            )}
          </div>
          <div className="flex gap-2 items-center">
            <p>Verifiable on-chain data</p>
            <Image
              src={VerifiableDataIcon}
              alt="Verifiable on-chain data"
              height={20}
            />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
