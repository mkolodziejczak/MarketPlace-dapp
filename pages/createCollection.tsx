import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants/index";
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay'


const createCollection = () => {
  const { account, library } = useWeb3React<Web3Provider>();
  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  const [name, setName] = useState<string | undefined>();
  const [symbol, setSymbol] = useState<string | undefined>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
  },[]);


  const nameInput = (input) => {
    setName(input.target.value)
  }

  const symbolInput = (input) => {
    setSymbol(input.target.value)
  }


  const submitForm = async () => {
    if (name == '' || name === undefined) {
      setError("Name cannot be empty");
      return
    }

    if (symbol == '' || symbol === undefined) {
      setError("Symbol cannot be empty");
      return
    }

    setLoading(true);
    const tx = await marketplaceContract.createNewCollection( name, symbol);
    await tx.wait();
    setLoading(false);

    resetForm();
  }

  const resetForm = async () => {
    setName('');
    setSymbol('');
    setError('');
  }

  return (
    <div className="results-form">
    {loading && (
        <div>
            <CircleSpinnerOverlay
            　　loading={loading} 
            overlayColor="rgba(0,153,255,0.2)"
            />
        </div>
    )}
    <div className="page-title">
      Create Collection
    </div>
    <form>
      <label>
        Name:
        <input onChange={nameInput} value={name} type="text" name="name" />
      </label>
      <label>  
        Symbol:
        <input onChange={symbolInput} value={symbol} type="text" name="symbol" />
      </label>
    </form>
    <div className="button-wrapper">
    <button onClick={submitForm}>Submit</button>
    </div>
    <div className="error">
        {error}
    </div>
    <style jsx>{`
        .results-form {
          display: flex;
          flex-direction: column;
        }
        .page-title{
            display: flex;
            justify-content: space-around;
            margin: 30 auto;
        }
      `}</style>
    </div>
  );
};

export default createCollection;
