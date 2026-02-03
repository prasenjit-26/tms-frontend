const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL as string | undefined;

export const ENV = {
  graphqlUrl: graphqlUrl ?? 'http://localhost:3000/graphql',
} as const;
