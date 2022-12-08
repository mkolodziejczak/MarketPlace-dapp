import React from 'react'
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants/index";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
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

const UserActions = () => {
  const { account, library } = useWeb3React();
  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  const isConnected = typeof account === "string" && !!library;

  const [error, setError] = useState<string | undefined>();
  const [balance, setBalance] = useState<string | undefined>();
  const [deposit, setDeposit] = useState<string | undefined>();
  const [withdrawal, setWithdrawal] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {

    const getBalance = async() => {
      const marketplaceBalance = await marketplaceContract.userToFunds(account);
      setBalance( marketplaceBalance.toNumber());
    };
    if( isConnected ) {
      getBalance();

      const filterFundsWithdrawal = marketplaceContract.filters.WithdrawalOfFunds(
        account, null
      );

      marketplaceContract.on(filterFundsWithdrawal, (user, funds) => {
        getBalance();
      });

      const filterFundsDeposit = marketplaceContract.filters.DepositOfFunds(
        account, null
      );
      
      marketplaceContract.on(filterFundsDeposit, (user, funds) => {
        getBalance();
      });

    }
    
  },[account]);

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

  const depositInput = (input) => {
    setDeposit(input.target.value)
  }
  const withdrawalInput = (input) => {
    setWithdrawal(input.target.value)
  }

  const depositFunds = async() => {
    setLoading(true);
    const signer = library.getSigner(account);
    const amount: BigNumber = parseValueToEth( deposit );

    const tx = signer.sendTransaction({
      to: MARKETPLACE_ADDRESS,
      value: amount
    });
    setLoading(false);
  }

  const withdrawFunds = async() => {

    setLoading(true);
    const amount: BigNumber = parseValueToEth( withdrawal );

    const currentBalance = ethers.BigNumber.from(balance);
    if (amount > currentBalance) {
      setError("Amount is bigger than the balance.");
      return
    }

    const tx = await marketplaceContract.withdrawFunds(amount);
    await tx.wait();
    setLoading(false);
  }

    return (
      <div className="NavBar">
        {loading && (
          <div>
              <CircleSpinnerOverlay
              　　loading={loading} 
              overlayColor="rgba(0,153,255,0.2)"
              />
          </div>
        )}
        <nav>
          
          {isConnected && !loading && (
            <ul>
              <li>Deposit funds: <input name="deposit" type="text" onChange={depositInput} value={deposit}></input><button onClick={depositFunds}>Deposit</button></li>

              <li>Withdraw funds: <input name="withdrawal" type="text" onChange={withdrawalInput} value={withdrawal}></input><button onClick={withdrawFunds}>Withdrawal</button></li>

              <li>Marketplace balance: {balance}</li>
              <li>{error}</li>
            </ul>
            )}
        </nav>
    </div>
    )
}
 
export default UserActions