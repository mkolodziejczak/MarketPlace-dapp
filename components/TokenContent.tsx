import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants/index";
import useSignatureProvider from "../hooks/useSignatureProvider";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay';
import { Offer, Token } from '../constants/types';

const names = [
    "kwei",
    "mwei",
    "gwei",
    "szabo",
    "finney",
    "ether",
    "wei",
  ];

export type TokenData = {
token: Token;
};

const TokenBalance = ({token}: TokenData) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  const [loading, setLoading] = useState<boolean>(false)
  const [errorData, setErrorData] = useState<string>("")
  const [salePrice, setSalePrice] = useState<string | undefined>();
  const [openSale, setOpenSale] = useState<boolean>(false);
  const [offerPrice, setOfferPrice] = useState<string | undefined>();
  const [openOffer, setOpenOffer] = useState<boolean>(false);

  const [approved, setApproved] = useState<boolean>(token.contractToken.approved);
  const [isListingPresent, setIsListingPresent] = useState<boolean>(token.contractToken.listing ? true : false);
  const [listingPrice, setListingPrice] = useState<number | undefined>();
  const [owner, setOwner] = useState<string>(token.contractToken.owner.id);
  const [isUserOfferPresent, setIsUserOfferPresent] = useState<boolean>(false);
  const [userOffer, setUserOffer] = useState<Offer | undefined>(findUserOffer(token.contractToken.offers));
  

  useEffect(() => {

    if (isListingPresent) {
      setListingPrice(token.contractToken.listing.price);
    }

    if (userOffer) {
      setIsUserOfferPresent(true);
    }

    if (account) {
      const filterTokenApproved = marketplaceContract.filters.MarketplaceApprovedForToken(
        token.contractToken.tokenId, token.contractToken.collection.id
      );

      marketplaceContract.on(filterTokenApproved, (tokenId, collectionId) => {
        setApproved(true);
      });

      const filterListedForSale = marketplaceContract.filters.ItemListedForSale(
        token.contractToken.tokenId, token.contractToken.collection.id, null
      );
      
      marketplaceContract.on(filterListedForSale, (tokenId, collectionId, price) => {
        setIsListingPresent(true);
        setListingPrice(price);
      });

      const filterWithdrawnFromSale = marketplaceContract.filters.ItemWithdrawnFromSale(
        token.contractToken.tokenId, token.contractToken.collection.id
      );
      
      marketplaceContract.on(filterWithdrawnFromSale, (tokenId, collectionId) => {
        setIsListingPresent(false);
      });

      const filterTradeConfirmed = marketplaceContract.filters.TradeConfirmed(
        token.contractToken.tokenId, token.contractToken.collection.id, null, null, null
      );
      
      marketplaceContract.on(filterTradeConfirmed, (tokenId, collectionId, fromUser, toUser: string, price) => {
        setOwner(toUser.toLowerCase());
      });

      const filterOfferMade = marketplaceContract.filters.OfferMade(
        token.contractToken.tokenId, token.contractToken.collection.id, account, null
      );
      
      marketplaceContract.on(filterOfferMade, (tokenId, collectionId, offerer, price) => {
        setIsUserOfferPresent(true);
        setUserOffer({price: price, offerer: { id: offerer}, active: true});
      });

      const filterOfferWithdrawn = marketplaceContract.filters.OfferWithdrawn(
        token.contractToken.tokenId, token.contractToken.collection.id, account
      );
      
      marketplaceContract.on(filterOfferWithdrawn, (tokenId, collectionId, offerer) => {
        setIsUserOfferPresent(false);
      });

      const filterOfferRejected = marketplaceContract.filters.OfferRejected(
        token.contractToken.tokenId, token.contractToken.collection.id, account
      );
      
      marketplaceContract.on(filterOfferRejected, (tokenId, collectionId, offerer) => {
        setUserOffer({price: userOffer.price, offerer: {id: userOffer.offerer.id}, active:false});
      });
    }
  },[account])

  function checkIfOfferer( offer: Offer ) : boolean {
    if (offer.offerer.id === account.toLowerCase()) {
      return true;
    }
    return false;
  }

  function findUserOffer( offers: Offer[] ) : Offer {
    let matched = null;
    offers.map(( offer, index) => {
      if (checkIfOfferer(offer)) {
        matched = offer;
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

    if( salePrice === "" || salePrice === undefined) {
      setErrorData("price cannot be null or 0");
      return
    }

    const parsedValue = parseValueToEth(salePrice);

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
  }

  const buyAnItem = async (tokenId, collectionAddress, price) => {
    setLoading(true);
    const tx = await marketplaceContract.buyAnItem(collectionAddress, tokenId, {
      value: price
    });
    await tx.wait();
    setLoading(false);
  }

  const makeAnOffer = async (tokenId, collectionAddress) => {
    setLoading(true);

    if( offerPrice === "" || offerPrice === undefined) {
      setErrorData("price cannot be null or 0");
      return
    }
    const parsedValue = parseValueToEth(offerPrice);
    const tx = await marketplaceContract.makeAnOffer(collectionAddress, tokenId, {
      value: parsedValue
    });
    await tx.wait();
    
    setLoading(false);
  }

  const withdrawAnOffer = async (tokenId, collectionAddress) => {
    setLoading(true);
    const tx = await marketplaceContract.withdrawAnOffer(collectionAddress, tokenId);
    await tx.wait();
    setLoading(false);
  }

  const rejectAnOffer = async (tokenId, collectionAddress, offerersAddress) => {
    setLoading(true);
    const tx = await marketplaceContract.rejectAnOffer(collectionAddress, tokenId, offerersAddress.id);
    await tx.wait();
    setLoading(false);
  }

  const approveAnOffer = async (tokenId, collectionAddress, offerersAddress) => {
    setLoading(true);
    const tx = await marketplaceContract.approveAnOffer(collectionAddress, tokenId, offerersAddress.id, {
      value: ethers.utils.parseUnits("1", "gwei")
    });
    await tx.wait();
    setLoading(false);
  }

  const priceInput = (input) => {
    setSalePrice(input.target.value);
  }

  const offerInput = (input) => {
    setOfferPrice(input.target.value);
  }

  const changeSaleStatus = () => {
    if (openSale) {
        setOpenSale(false);
    } else {
        setOpenSale(true);
    }
  }

  const changeOfferStatus = () => {
    if (openOffer) {
        setOpenOffer(false);
    } else {
        setOpenOffer(true);
    }
  }

  return (
    <div>
        {loading && (
            <div>
                <CircleSpinnerOverlay
                　　loading={loading} 
                overlayColor="rgba(0,153,255,0.2)"
                />
            </div>
        )}
        <p><img src={token.imageUrl} /></p>
        <p>{token.metadata.name}</p>
        <p>{token.metadata.description}</p>
        <p>Owner: {token.contractToken.owner.id}</p>
        <p>Collection: {token.contractToken.collection.collectionName}</p>

        {/* OWNER ACTIONS */}
        {owner === account.toLowerCase() && (
          !approved && (
              <div className="operations">
              <button onClick={() => approve(token.contractToken.tokenId, token.contractToken.collection.id, token.contractToken.collection.collectionName)}>Approve</button>
              </div>
          ) ||
          approved && !isListingPresent && (
              <div className="operations">
              <button onClick={changeSaleStatus}>Sell</button>
              { openSale && (
                  <div className="operations">
                      <input name={`salePrice-${token.contractToken.id}`} type="text" onChange={priceInput} value={salePrice}/>
                      <button onClick={()=>sell(token.contractToken.id, token.contractToken.tokenId, token.contractToken.collection.id)}>Set</button>
                  </div>
              )}
              </div>
          ) ||
          isListingPresent && (
              <div className="operations">
                  <button onClick={async () => {await withdrawForSale(token.contractToken.tokenId, token.contractToken.collection.id);}}>Cancel sale</button>
                  <h2>{listingPrice}</h2>
              </div>
          )
        )}
        {owner === account.toLowerCase() && token.contractToken.offers.length > 0 && (
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


        {/* BUYER ACTIONS */}
        {!(owner === account.toLowerCase()) && isListingPresent && (
            <div className="operations">
                <button onClick={async () => {await buyAnItem(token.contractToken.tokenId, token.contractToken.collection.id, token.contractToken.listing.price);}}>Buy</button>
                <h2>{token.contractToken.listing.price}</h2>
            </div>
        )}
        {!(owner === account.toLowerCase()) && (!isUserOfferPresent || !userOffer.active) && (
        <div className="operations">
            <button onClick={changeOfferStatus}>Make an offer</button>
            { openOffer && (
                <div className="operations">
                    <input name={`offerPrice-${token.contractToken.id}`} type="text" onChange={offerInput} value={offerPrice}/>
                    <button onClick={()=>makeAnOffer(token.contractToken.tokenId, token.contractToken.collection.id)}>Set</button>
                </div>
            )}
        </div>
        )}
        {!(owner === account.toLowerCase()) && isUserOfferPresent && (
        <div className="operations">
            <div>
            <b>YOUR OFFER:</b>
              <div>Active: {userOffer.active ? "Yes" : "No"} Price: {userOffer.price} 
                {userOffer.active && (
                <button onClick={async () => {await withdrawAnOffer(token.contractToken.tokenId, token.contractToken.collection.id);}}>Withdraw the offer</button>
                )}
              </div>  
            </div>
        </div>
        )}
        <div className="error">
            {errorData}
        </div>
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
    </div>
  );
};

export default TokenBalance;
