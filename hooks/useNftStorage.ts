import { NFTStorage, File } from 'nft.storage'
import mime from 'mime'
import fs from 'fs'

import path from 'path'
import { NFT_STORAGE_KEY } from "../constants";

export default async function useNftStorage(imagePath: string, name: string, description: string) {
  const result = await storeNFT(imagePath, name, description)
  return result;
}

async function storeNFT(imagePath, name, description) {
    const image = await fileFromPath(imagePath)

    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    return nftstorage.store({
        image,
        name,
        description,
    })
}

async function fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath)
    return new File([content], path.basename(filePath), { type })
}


