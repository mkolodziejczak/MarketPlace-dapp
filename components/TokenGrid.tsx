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
import { BigNumberish, ethers } from "ethers";
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay'

const names = [
  "kwei",
  "mwei",
  "gwei",
  "szabo",
  "finney",
  "ether",
  "wei",
];

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
  active: boolean;
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
  const [loading, setLoading] = useState<boolean>(false)

  const [errorData, setErrorData] = useState(new Map());
  const updateErrorData = (k,v) => {
    setErrorData(errorData.set(k,v));
  }
  const [saleData, setSaleData] = useState(new Map());
  const updateSaleData = (k,v) => {
    setSaleData(saleData.set(k,v));
  }

  const [offerData, setOfferData] = useState(new Map());
  const updateOfferData = (k,v) => {
    setOfferData(offerData.set(k,v));
  }

  async function getMetadataFromUrl( url: string) {
    const metadata = url.replace('ipfs://', 'https://ipfs.io/ipfs/');

    try {
      let response = await fetch(metadata);
      const responseJson : Metadata = await response.json();
      return responseJson;
     } catch(error) {
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
      for (const token of data) {
        if( token.uri != "" ) {
          let newToken: Token = await processToken(token);
          tokensArray.push(newToken);
        }
      }
      setTokens(tokensArray);
    };
    console.log(data);
    processTokens(data);
  },[]);

  function checkIfOfferer( offer: Offer ) : boolean {
    if (offer.offerer.id === account.toLowerCase()) {
      return true;
    }
    return false;
  }

  function checkIfOfferExists( offers: Offer[] ) : boolean {
    let matched = false;
    offers.map(( offer, index) => {
      if (checkIfOfferer(offer) && offer.active) {
        matched = true;
      }
    });
    return matched;
  }

  const approve = async (tokenId, collectionAddress, collectionName) => {
    setLoading(true);
    const signer = library.getSigner(account);
    const nonce = await marketplaceContract.getTokenNonce(collectionAddress, tokenId);

    const signature = await useSignatureProvider(collectionName, collectionAddress, 
      tokenId, signer, MARKETPLACE_ADDRESS, nonce);

    const tx = await marketplaceContract.grantPermission(collectionAddress, tokenId, signature.deadline, 
      signature.v, signature.r, signature.s);

    await tx.wait();
    setLoading(false);
  }

  const checkIfApplicableToParse = ( amount: string) => {
    for (const unit of names) {
      if (amount.indexOf(unit) > -1) {
        return unit;
      }
    }
    return null;
  }

  const parseValueToEth = ( amount: string ) => {

    const unit = checkIfApplicableToParse(amount);

    if (unit) {
      const newValue = amount.replace(unit, "").replace(/\s/g, "");
      return ethers.utils.parseUnits(newValue, unit);
    } else {
      return ethers.BigNumber.from(amount);
    }
  }

  const sell = async (id, tokenId, collectionAddress) => {
    setLoading(true);
    const amount = saleData.get("salePrice-"+id);

    if( amount == "" || amount === undefined) {
      updateErrorData(id, "price cannot be null or 0");
      return
    }

    const parsedValue = parseValueToEth(amount);

    const tx = await marketplaceContract.listForSale(collectionAddress, tokenId, parsedValue, {
      value: ethers.utils.parseUnits("1", "gwei")
    });
    await tx.wait();
    setLoading(false);
    window.location.reload();
  }

  const withdrawForSale = async (tokenId, collectionAddress) => {
    setLoading(true);
    const tx = await marketplaceContract.withdrawFromSale(collectionAddress, tokenId);
    await tx.wait();
    setLoading(false);
    window.location.reload();
  }

  const buyAnItem = async (tokenId, collectionAddress, price) => {
    setLoading(true);
    const tx = await marketplaceContract.buyAnItem(collectionAddress, tokenId, {
      value: price
    });
    await tx.wait();
    setLoading(false);
    window.location.reload();
  }

  const makeAnOffer = async (id, tokenId, collectionAddress) => {
    setLoading(true);
    const amount = offerData.get('offerPrice-'+id);
    if( amount == "" || amount === undefined) {
      updateErrorData(id, "price cannot be null or 0");
      return
    }
    const parsedValue = parseValueToEth(amount);
    const tx = await marketplaceContract.makeAnOffer(collectionAddress, tokenId, {
      value: parsedValue
    });
    await tx.wait();
    setLoading(false);
    window.location.reload();
  }

  const withdrawAnOffer = async (tokenId, collectionAddress) => {
    setLoading(true);
    const tx = await marketplaceContract.withdrawAnOffer(collectionAddress, tokenId);
    await tx.wait();
    setLoading(false);
    window.location.reload()
  }

  const rejectAnOffer = async (tokenId, collectionAddress, offerersAddress) => {
    setLoading(true);
    const tx = await marketplaceContract.rejectAnOffer(collectionAddress, tokenId, offerersAddress.id);
    await tx.wait();
    setLoading(false);
    window.location.reload()
  }

  const approveAnOffer = async (tokenId, collectionAddress, offerersAddress) => {
    setLoading(true);
    const tx = await marketplaceContract.approveAnOffer(collectionAddress, tokenId, offerersAddress.id, {
      value: ethers.utils.parseUnits("1", "gwei")
    });
    await tx.wait();
    setLoading(false);
    window.location.reload()
  }

  const priceInput = (input) => {
    updateSaleData(input.target.name, input.target.value);
  }

  const offerInput = (input) => {
    updateOfferData(input.target.name, input.target.value);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {loading && (
        <div>
            <CircleSpinnerOverlay
            　　loading={loading} 
            overlayColor="rgba(0,153,255,0.2)"
            />
        </div>
      )}
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {tokens.map((token: Token, index) => (
          <Grid item xs={2} sm={4} md={4} key={index}>
            <Item>
              <p><img src={token.imageUrl} /></p>
              <p>{token.metadata.name}</p>
              <p>{token.metadata.description}</p>
              <p>Owner: {token.contractToken.owner.id}</p>
              <p>Collection: {token.contractToken.collection.collectionName}</p>
              {token.contractToken.owner.id === account.toLowerCase() && !token.contractToken.approved && (
                <div className="operations">
                  <button onClick={() => approve(token.contractToken.tokenId, token.contractToken.collection.id, token.contractToken.collection.collectionName)}>Approve</button>
                </div>
              )}
              {token.contractToken.owner.id === account.toLowerCase() && token.contractToken.approved && !token.contractToken.listing && (
                <div className="operations">
                  <button onClick={()=>sell(token.contractToken.id, token.contractToken.tokenId, token.contractToken.collection.id)}>Sell</button>
                  <input name={`salePrice-${token.contractToken.id}`} type="text" onChange={priceInput} value={saleData.get('salePrice-'+token.contractToken.id)}/>
                </div>
              )}
              {token.contractToken.owner.id === account.toLowerCase() && token.contractToken.listing && (
                <div className="operations">
                  <button onClick={async () => {await withdrawForSale(token.contractToken.tokenId, token.contractToken.collection.id);}}>Cancel sale</button>
                  <h2>{token.contractToken.listing.price}</h2>
                </div>
              )}
              {!(token.contractToken.owner.id === account.toLowerCase()) && token.contractToken.listing && (
                <div className="operations">
                  <button onClick={async () => {await buyAnItem(token.contractToken.tokenId, token.contractToken.collection.id, token.contractToken.listing.price);}}>Buy</button>
                  <h2>{token.contractToken.listing.price}</h2>
                </div>
                
              )}
              {!(token.contractToken.owner.id === account.toLowerCase()) && !checkIfOfferExists(token.contractToken.offers) && (
                <div className="operations">
                  <button onClick={()=>makeAnOffer(token.contractToken.id, token.contractToken.tokenId, token.contractToken.collection.id)}>Make an offer</button>
                  <input name={`offerPrice-${token.contractToken.id}`} type="text" onChange={offerInput} value={offerData.get('offerPrice-'+token.contractToken.id)}/>
                </div>
              )}
              {token.contractToken.owner.id === account.toLowerCase() && token.contractToken.offers.length > 0 && (
                <div>
                  <b>OFFERS:</b>
                <div className="operations">
                {token.contractToken.offers.map((offer: Offer, index) => (
                  offer.active && (
                  <div>User: {offer.offerer.id} Price: {offer.price} 
                    <button onClick={async () => {await approveAnOffer(token.contractToken.tokenId, token.contractToken.collection.id, offer.offerer);}}>Accept</button>
                    <button onClick={async () => {await rejectAnOffer(token.contractToken.tokenId, token.contractToken.collection.id, offer.offerer);}}>Reject</button>
                  </div> 
                  )
                ))}
                </div></div>
              )}
              {!(token.contractToken.owner.id === account.toLowerCase()) && token.contractToken.offers.length > 0 && (
                <div className="operations">
                <div>
                <b>YOUR OFFER:</b>
                {token.contractToken.offers.map((offer: Offer, index) => (
                  checkIfOfferer(offer) && (
                    <div>Active: {offer.active ? "Yes" : "No"} Price: {offer.price} 
                      {offer.active && (
                      <button onClick={async () => {await withdrawAnOffer(token.contractToken.tokenId, token.contractToken.collection.id);}}>Withdraw the offer</button>
                      )}
                    </div>  
                  )
                ))}
                </div></div>
              )}
              <div className="error">
                  {errorData.get(token.contractToken.id)}
              </div>
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
          margin: 10px;
        }
      `}</style>
    </Box>

  );
};
export default TokenGrid;