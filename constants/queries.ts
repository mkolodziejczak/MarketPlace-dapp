export const TOKENS_QUERY = `
  query {
    tokens(first: 20) {
        id
        tokenId
        owner {
            id
        }
        collection {
            id
            collectionName
        }
        listing {
            price
        }
        offers {
            offerer {
                id
            }
            price
            active
        }
        approved
        uri
      }
  }
`;

export const USER_TOKENS_QUERY = `
  query($userAddress: String) {
    user(id: $userAddress) 
    {
        tokens {
            id
            tokenId
            collection {
                id
                collectionName
            }
            owner {
                id
            }
            listing{
                id
                price
            }
            offers {
                id
                offerer {
                    id
                }
                price
                active
          }
          uri
          approved
        }
    }
  }
`;

export const USER_COLLECTIONS_QUERY = `
  query ($userAddress: String) {
    user(id: $userAddress) {
        collections {
            id
            collectionAddress
            collectionName
        }
    }
  }  
`;

export const COLLECTION_TOKENS_QUERY = `
  query($collectionAddress: String) {
    collection(id: $collectionAddress) 
    {
          tokens{
          id
          tokenId
          collection {
            id
            collectionName
          }
          owner{
            id
          }
          listing{
            id
            price
          }
          offers {
            id
            offerer {
              id
            }
            price
            active
          }
          uri
          approved
        }
    }
  }
`;

export const TOKEN_QUERY = `
  query($tokenId: String) {
    tokens(id: $tokenId ) {
        id
        tokenId
        owner {
            id
        }
        collection {
            id
            collectionName
        }
        listing {
            price
        }
        offers {
            offerer {
                id
            }
            price
            active
        }
        approved
        uri
      }
  }
`;
