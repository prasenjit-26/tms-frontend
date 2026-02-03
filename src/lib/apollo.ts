import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { ENV } from "../env";
import { AUTH_STORAGE_KEY } from "./auth.storage";

export function createApolloClient(getAccessToken: () => string | null) {
  const httpLink = new HttpLink({
    uri: ENV.graphqlUrl,
  });

  const authLink = setContext(
    (operation: unknown, prevContext: { headers?: Record<string, string> }) => {
      console.log("operation", operation);
      const token = getAccessToken();
      return {
        headers: {
          ...(prevContext.headers ?? {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
    },
  );
  const errorLink = onError(({ graphQLErrors }) => {
    const isUnauthedGql =
      graphQLErrors?.some(
        (e) =>
          e.extensions?.code === "UNAUTHENTICATED" ||
          (typeof e.message === "string" &&
            e.message.toLowerCase().includes("unauthorized")),
      ) ?? false;
    if (isUnauthedGql) {
      // TODO: Handle unauthorized error
      console.log("Unauthorized error");
      localStorage.removeItem(AUTH_STORAGE_KEY);

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  });
  return new ApolloClient({
    link: authLink.concat(errorLink).concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            shipments: {
              keyArgs: ["filter", "sort"],
            },
          },
        },
      },
    }),
  });
}
