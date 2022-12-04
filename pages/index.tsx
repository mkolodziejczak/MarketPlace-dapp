import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Head from "next/head";
import TokenGrid from "../components/TokenGrid";
import useApolloClient from "../hooks/useApolloClient";
import { gql } from '@apollo/client';
import { TOKENS_QUERY, USER_TOKENS_QUERY, COLLECTION_TOKENS_QUERY } from "../constants/queries";
import Router from 'next/router'

function Home() {
  const { account, library } = useWeb3React();

  const [userToSearch, setUserToSearch] = useState<string>('');
  const [collectionToSearch, setCollectionToSearch] = useState<string>('');
  const isConnected = typeof account === "string" && !!library;
  const [result, setResult] = useState<JSX.Element[]>([]);

  const userToSearchInput = (input) => {
    setUserToSearch(input.target.value)
  }

  const collectionToSearchInput = (input) => {
    setCollectionToSearch(input.target.value)
  }

  useEffect(() => {
    useApolloClient()
      .query({
        query: gql(TOKENS_QUERY),
      })
      .then((data) => setResult( data.data.tokens ))
      .catch((err) => {
        console.log('Error fetching data: ', err)
      })
  },[]);


  function searchUser() {
    useApolloClient()
    .query({
      query: gql(USER_TOKENS_QUERY),
      variables: {
        userAddress: userToSearch,
      },
    })
    .then((data) => route( data.data.tokens, '/searchResults' ))
    .catch((err) => {
      console.log('Error fetching data: ', err)
    })
  }

  function searchCollection() {
    useApolloClient()
    .query({
      query: gql(COLLECTION_TOKENS_QUERY),
      variables: {
        collectionAddress: collectionToSearch,
      },
    })
    .then((data) => route( data.data.tokens, '/searchResults' ))
    .catch((err) => {
      console.log('Error fetching data: ', err)
    })
  }


  function route (param, url : string) {
    console.log( param )
    Router.push({
      pathname: url,
      query: { tokens: param }
    })
  }

  return (
    <div>
      <Head>
        <title>Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
      {isConnected ? (
        <div>
          <div className="searchBar">
            Search tokens by user: <input onChange={userToSearchInput} value={userToSearch} type="text" name="userToSearch" />
            <div className="button-wrapper">
              <button onClick={searchUser}>Search</button>
            </div>
            </div>
            <div  className="searchBar">
            Search tokens by collection: <input onChange={collectionToSearchInput} value={collectionToSearch} type="text" name="CollectionToSearch" />
            <div className="button-wrapper">
              <button onClick={searchCollection}>Search</button>
            </div>
          </div>
          <section>
            Tokens:
            { result.length > 0 && (
            <TokenGrid data={result} />
            )}
          </section>
        </div>
        ) : (
          <div>
            <h1>
              This is NFT Market Place
            </h1>
            <h2>
              You can use this marketplace to create, buy & sell NFTs
            </h2>
          </div> )
        }

      </main>

      <style jsx>{`
        nav {
          display: flex;
          justify-content: space-between;
        }

        main {
          text-align: center;
        }
        .searchBar {
          margin: 1% 35%;
        }
      `}</style>
    </div>
  );
}

export default Home;
