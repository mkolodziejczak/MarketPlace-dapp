import { ApolloClient, InMemoryCache } from '@apollo/client'

const APIURL = 'https://api.studio.thegraph.com/query/37975/marketplace-graph/1.6'


export default function useLibraryContract() {
    return new ApolloClient({
        uri: APIURL,
        cache: new InMemoryCache(),
      });
  }
  
