import React from 'react'
import Link from 'next/link'
import useEagerConnect from "../hooks/useEagerConnect";
import Account from "./Account";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants/index";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";

const Navbar = () => {
  const { account, library } = useWeb3React();
  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  const [balance, setBalance] = useState<string | undefined>();

  useEffect(() => {

    const getBalance = async() => {
      const marketplaceBalance = await marketplaceContract.userToFunds(account);
      setBalance( marketplaceBalance.toNumber());
    };
    if( isConnected ) {
      getBalance();
    }
    
  },[]);

    return (
      <div className="NavBar">
        <nav>
          <ul>
            <Link href="/">
            <li><a>Home</a></li>
            </Link>
            <Link href="/mintItem">
            <li><a>Mint</a></li>
            </Link>
            <Link href="/createCollection">
            <li><a>Collection</a></li>
            </Link>
            <Link href="/profile">
            <li><a>Profile</a></li>
            </Link>
            <Account triedToEagerConnect={triedToEagerConnect} />
            
            {isConnected && (<li>Marketplace balance: {balance}</li>
            )}
          </ul>
        </nav>
    </div>
    )
}
 
export default Navbar