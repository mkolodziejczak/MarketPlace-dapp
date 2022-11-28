import { NFTStorage } from 'nft.storage'
import { NFT_STORAGE_KEY } from "../constants";

export default async function useNftStorage(image: any, name: string, description: string) {
  const result = await storeNFT(image, name, description)
  return result;
}

async function storeNFT(image, name, description) {

    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    return nftstorage.store({
        image,
        name,
        description,
    })
}




