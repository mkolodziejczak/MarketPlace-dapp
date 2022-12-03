import * as React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants/index";
import useSignatureProvider from "../hooks/useSignatureProvider";
import type { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";

type TokenData = {
    data: ContractToken[];
  };

type Metadata = {
  name: string;
  description: string;
  image: string;
};

type Offer = {
  price: number;
  offerer: string;
}

type ContractToken = {
  id: string;
  tokenId: string;
  owner: { id: string; };
  collection: { id: string, collectionName: string; };
  listing: { price: number; };
  offers: Offer[];
  approved: boolean;
  uri: string;
}

class Token {
  metadata: Metadata;
  contractToken: ContractToken;
  imageUrl: string;
  constructor(metadata: Metadata, contractToken: ContractToken, imageUrl: string) {
    this.metadata = metadata;
    this.contractToken = contractToken;
    this.imageUrl = imageUrl;
  }
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const TokenGrid = ({ data }: TokenData) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [allowSale, setAllowSale] = useState<JSX.Element[]>([]);

  async function getMetadataFromUrl( url: string) {
    const metadata = url.replace('ipfs://', 'https://ipfs.io/ipfs/');

    try {
      let response = await fetch(metadata);
      const responseJson : Metadata = await response.json();
      console.log(responseJson);
      return responseJson;
     } catch(error) {
      console.error(error);
    }
  }
  
  async function processToken(token: ContractToken) {
    let metadata: Metadata = await getMetadataFromUrl(token.uri);
    let imageUrl = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    return new Token(metadata, token, imageUrl);
  }

  useEffect(() => {

    const processTokens = async(data) => {
      console.log(data);
      let tokensArray = [];
      let sales = [];
      for (const token of data) {
        if( token.uri != "" ) {
          let newToken: Token = await processToken(token);
          tokensArray.push(newToken);
          sales.push({id: token.id, allowed: false})
        }
      }
      setTokens(tokensArray);
      setAllowSale(sales);
    };

    processTokens(data);
  },[]);

  function checkIfOfferer( offer: Offer ) : boolean {
    if (offer.offerer.localeCompare(account)) {
      return true;
    }
    return false;
  }


  function checkIfSale( tokenId ) {
    var result = allowSale.filter(obj => {
      return obj.id === tokenId;
    });
    if (result && result.allowed) {
      return true;
    }
    return false;
  }


  const approve = async (tokenId, collectionAddress, collectionName) => {
    const signer = library.getSigner(account);
    const nonce = await marketplaceContract.getTokenNonce(collectionAddress, tokenId);

    const signature = await useSignatureProvider(collectionName, collectionAddress, 
      tokenId, signer, MARKETPLACE_ADDRESS, nonce);

    const tx = await marketplaceContract.grantPermission(collectionAddress, tokenId, signature.deadline, 
      signature.v, signature.r, signature.s);

    await tx.wait();
  }

  const sell = async (tokenId, collectionAddress, price) => {

    const tx = await marketplaceContract.listForSale(collectionAddress, tokenId, price, {
      value: ethers.utils.parseUnits('1', 'gwei')
    });
    await tx.wait();
  }

  const withdrawForSale = async (tokenId, collectionAddress) => {
    const tx = await marketplaceContract.withdrawFromSale(collectionAddress, tokenId);
    await tx.wait();
  }

  const buyAnItem = async (tokenId, collectionAddress, price) => {
    const tx = await marketplaceContract.buyAnItem(collectionAddress, tokenId, {
      value: price
    });
    await tx.wait();
  }

  const makeAnOffer = async (tokenId, collectionAddress, price) => {
    const tx = await marketplaceContract.makeAnOffer(collectionAddress, tokenId, {
      value: price
    });
    await tx.wait();
  }

  const withdrawAnOffer = async (tokenId, collectionAddress) => {
    const tx = await marketplaceContract.withdrawAnOffer(collectionAddress, tokenId);
    await tx.wait();
  }

  const rejectAnOffer = async (tokenId, collectionAddress, offerersAddress) => {
    const tx = await marketplaceContract.rejectAnOffer(collectionAddress, tokenId, offerersAddress);
    await tx.wait();
  }

  const approveAnOffer = async (tokenId, collectionAddress, offerersAddress) => {
    const tx = await marketplaceContract.rejectAnOffer(collectionAddress, tokenId, offerersAddress);
    await tx.wait();
  }


  const allowForSale = (tokenId) => {
    console.log(allowSale);
    var result = allowSale.findIndex(obj => {
      return obj.id === tokenId;
    });
    let newArr = [...allowSale];
    newArr[result].allow =true;
    setAllowSale(newArr);

  }



  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {tokens.map((token: Token, index) => (
          <Grid item xs={2} sm={4} md={4} key={index}>
            <Item>
              <p><img src={token.imageUrl} /></p>
              <p>{token.metadata.name}</p>
              <p>{token.metadata.description}</p>
              <p>Owner: {token.contractToken.owner.id}</p>
              <p>Collection: {token.contractToken.collection.collectionName}</p>
              {token.contractToken.owner.id.localeCompare(account) && !token.contractToken.approved && (
                <div className="operations">
                  <button onClick={() => approve(token.contractToken.tokenId, token.contractToken.collection.id, token.contractToken.collection.collectionName)}>Approve</button>
                </div>
              )}
              {token.contractToken.owner.id.localeCompare(account) && token.contractToken.approved && (
                <div className="operations">
                  <button disabled={checkIfSale(token.contractToken.id)} onClick={()=>allowForSale(token.contractToken.id)}>Sell</button>
                  {checkIfSale(token.contractToken.id) && (
                    <div>
                      <input name="salePrice" />
                      <button>Set</button>
                      <button>Cancel</button>
                    </div>
                  )}
                </div>
              )}
              {token.contractToken.owner.id.localeCompare(account) && token.contractToken.listing && (
                <div className="operations">
                  <button onClick={async () => {await withdrawForSale(token.contractToken.tokenId, token.contractToken.collection.id);}}>Cancel sale</button>
                  <div>{token.contractToken.listing.price}</div>
                </div>
              )}
              {!token.contractToken.owner.id.localeCompare(account) && token.contractToken.listing && (
                <div className="operations">
                  <button onClick={async () => {await buyAnItem(token.contractToken.tokenId, token.contractToken.collection.id, token.contractToken.listing.price);}}>Buy</button>
                  <div>{token.contractToken.listing.price}</div>
                </div>
                
              )}
              {!token.contractToken.owner.id.localeCompare(account) && !token.contractToken.listing && (
                <button onClick={async () => {await buyAnItem(token.contractToken.tokenId, token.contractToken.collection.id, token.contractToken.listing.price);}}>Make an offer</button>

              )}
              {token.contractToken.owner.id.localeCompare(account) && token.contractToken.offers.length > 0 && (
                <div className="operations">
                {token.contractToken.offers.map((offer: Offer, index) => (
                  <li>User: {offer.offerer} Price: {offer.price} 
                    <button onClick={async () => {await approveAnOffer(token.contractToken.tokenId, token.contractToken.collection.id, offer.offerer);}}>Accept</button>
                    <button onClick={async () => {await rejectAnOffer(token.contractToken.tokenId, token.contractToken.collection.id, offer.offerer);}}>Reject</button>
                  </li>  
                ))}
                </div>
              )}
              {!token.contractToken.owner.id.localeCompare(account) && token.contractToken.offers.length > 0 && (
                <div className="operations">
                {token.contractToken.offers.map((offer: Offer, index) => (
                  checkIfOfferer(offer) && (
                    <li>Price: {offer.price} 
                      <button onClick={async () => {await withdrawAnOffer(token.contractToken.tokenId, token.contractToken.collection.id);}}>Withdraw the offer</button>
                    </li>  
                  )
                ))}
                </div>
              )}
              </Item>
          </Grid>
        ))}
      </Grid >
      <style jsx>{`
        .operations {
          display: flex;
          justify-content: space-between;
          margin: 0% 15%;
        }
        .operations button {
          padding: 10px;
        }
      `}</style>
    </Box>

  );
};
export default TokenGrid;