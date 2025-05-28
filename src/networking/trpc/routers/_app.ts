import { createCallerFactory, createTRPCRouter } from "../init";
import { defaultRouter } from "./default";

export const appRouter = createTRPCRouter({
  default: defaultRouter,
});
export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
