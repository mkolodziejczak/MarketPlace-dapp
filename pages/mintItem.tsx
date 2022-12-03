import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import useApolloClient from "../hooks/useApolloClient";
import { gql } from '@apollo/client';
import { USER_COLLECTIONS_QUERY } from "../constants/queries";
import useNftStorage from "../hooks/useNftStorage";
import { MARKETPLACE_ADDRESS } from "../constants/index"

type Collection = {
    collectionName: string;
    collectionAddress: string;
  };


const MintItem = () => {
  const { account, library } = useWeb3React<Web3Provider>();
  const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
  const [name, setName] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [collection, setCollection] = useState<string | undefined>();
  const [file, setFile] = useState();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    useApolloClient()
      .query({
        query: gql(USER_COLLECTIONS_QUERY),
        variables: {
            userAddress: account,
        },
      })
      .then((data) => setUpCollections(data.data.collections))
      .catch((err) => {
        console.log('Error fetching data: ', err)
      })
  },[]);

  function setUpCollections (collections : Collection[]) {
    setCollections( collections );
    if (collections.length > 0) {
        setCollection(collections[0].collectionAddress);
    }
  }


  const nameInput = (input) => {
    setName(input.target.value)
  }

  const descriptionInput = (input) => {
    setDescription(input.target.value)
  }

  const collectionInput = (input) => {
    console.log( input.target )
    setCollection(input.target.value)
  }

  const fileInput = (input) => {
    setFile(input.target.files[0]);
  }

  const submitStateResults = async () => {
    if (name == ''|| name === undefined) {
        setError("Name cannot be empty");
        return
    }
    if (file === undefined) {
        setError("File cannot be empty");
        return
    }
    if (collection == '' || collection === undefined) {
        setError("Collection cannot be empty");
        return
    }

    const uri = await useNftStorage(file, name, description);

    if( uri === undefined || uri.url == '' ) {
        setError("File upload failed.");
        return
    }
    const tx = await marketplaceContract.createNewToken( collection, uri.url)
    await tx.wait();

    resetForm();
  }

  const resetForm = async () => {
    setName('');
    setDescription('');
    setCollection('');
    setFile( undefined );
    setError('');
  }

  return (
    <div className="results-form">
    <div className="page-title">
      Mint NFT
    </div>
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
                <option key="{d.collectionAddress}" value="{d.collectionAddress}">{d.collectionName}</option>
            ))}
        </select>
      </label>
      <label>
        File:
        <input onChange={fileInput} type="file" name="file" />
      </label>
    </form>
    <div className="button-wrapper">
    <button onClick={submitStateResults}>Submit Results</button>
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

export default MintItem;
