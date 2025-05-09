"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

type ProviderProps = {
  children: React.ReactNode;
};

export function ReactQueryProvider(props: ProviderProps) {
  const [queryClient] = React.useState(() => new QueryClient());

  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    props.children
  );
}
