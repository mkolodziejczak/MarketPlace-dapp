import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import useApolloClient from "../hooks/useApolloClient";
import { gql } from '@apollo/client';
import { USER_COLLECTIONS_QUERY } from "../constants/queries";
import useNftStorage from "../hooks/useNftStorage";

type MarketplaceContract = {
  contractAddress: string;
};


const MintItem = ({ contractAddress }: MarketplaceContract) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const marketplaceContract = useMarketplaceContract(contractAddress);
  const [currentLeader, setCurrentLeader] = useState<string>('Unknown');
  const [name, setName] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [collection, setCollection] = useState<string | undefined>();
  const [file, setFile] = useState();
  const [collections, setCollections] = useState<JSX.Element[]>([]);

  useEffect(() => {
    useApolloClient()
      .query({
        query: gql(USER_COLLECTIONS_QUERY),
        variables: {
          first: account,
        },
      })
      .then((data) => setCollections(data.data.collections))
      .catch((err) => {
        console.log('Error fetching data: ', err)
      })
  },[]);

  const nameInput = (input) => {
    setName(input.target.value)
  }

  const descriptionInput = (input) => {
    setDescription(input.target.value)
  }

  const collectionInput = (input) => {
    setCollection(input.target.value)
  }

  const fileInput = (input) => {
    setFile(input.target.file[0])
  }

  const submitStateResults = async () => {
    const uri = useNftStorage(file, name, description);
     
    //const tx = await usElectionContract.submitStateResult(result);
    //await tx.wait();
    resetForm();
  }

  const resetForm = async () => {
    setName('');
    setDescription('');
    setCollection('');
    setFile( undefined );
  }

  return (
    <div className="results-form">
    <p>
      Current Leader is: {collections}
    </p>
    <form>
      <label>
        Name:
        <input onChange={nameInput} value={name} type="text" name="name" />
      </label>
      <label>
        Description:
        <input onChange={descriptionInput} value={description} type="text" name="description" />
      </label>
      <label>
        Collection:
        <select value={collection} onChange={collectionInput}>
            {collections.map((d) => (
                <option value="{d.id}"> d.collectionName</option>
            ))}
        </select>
      </label>
      <label>
        File:
        <input onChange={fileInput} value={file} type="file" name="file" />
      </label>
      {/* <input type="submit" value="Submit" /> */}
    </form>
    <div className="button-wrapper">
    <button onClick={submitStateResults}>Submit Results</button>
    </div>
    <div className="error">
        ERROR
    </div>
    <style jsx>{`
        .results-form {
          display: flex;
          flex-direction: column;
        }
        
      `}</style>
    </div>
  );
};

export default MintItem;
