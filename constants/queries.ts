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
    tokens {
        id
        tokenId
        owner(id: $userAddress) {
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

export const USER_COLLECTIONS_QUERY = `
  query ($userAddress: String) {
    collections(creator: $userAddress) {
        id
        collectionAddress
        collectionName
        creator {
            id
        }
    }
  }  
`;

export const COLLECTION_TOKENS_QUERY = `
  query($collectionAddress: String) {
    tokens {
        id
        tokenId
        owner {
            id
        }
        collection (id: $collectionAddress) {
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
