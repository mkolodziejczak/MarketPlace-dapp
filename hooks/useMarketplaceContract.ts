import MARKETPLACE_ABI from "../contracts/Marketplace.json";
import type { Marketplace } from "../contracts/types";
import useContract from "./useContract";

export default function useMarketplaceContract(contractAddress?: string) {
  return useContract<Marketplace>(contractAddress, MARKETPLACE_ABI);
}
