export const TOKENS_QUERY = `
  query {
    tokens(first: 20) {
        id
        tokenId
        owner {
            id
        }
        collection {
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
        }
        approved
        uri
      }
  }
`;

export const USER_TOKENS_QUERY = `
  query($userAddress: String) {
    tokens {
        id
        tokenId
        owner(id: $userAddress) {
            id
        }
        collection {
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
        }
        approved
        uri
      }
  }
`;

export const USER_COLLECTIONS_QUERY = `
  query ($userAddress: String) {
    collections(creator: userAddress) {
        id
        collectionAddress
        collectionName
        creator
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
        }
        approved
        uri
      }
  }
`;
