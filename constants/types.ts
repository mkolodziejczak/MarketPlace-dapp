
  export type Metadata = {
    name: string;
    description: string;
    image: string;
  };
  
  export type Offer = {
    price: number;
    offerer: { id: string };
    active: boolean;
  }
  
  export type ContractToken = {
    id: string;
    tokenId: string;
    owner: { id: string; };
    collection: { id: string, collectionName: string; };
    listing: { price: number; };
    offers: Offer[];
    approved: boolean;
    uri: string;
  }
  
  export class Token {
    metadata: Metadata;
    contractToken: ContractToken;
    imageUrl: string;
    constructor(metadata: Metadata, contractToken: ContractToken, imageUrl: string) {
      this.metadata = metadata;
      this.contractToken = contractToken;
      this.imageUrl = imageUrl;
    }
  };