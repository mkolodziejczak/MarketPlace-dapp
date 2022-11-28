import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Head from "next/head";
import TokenGrid from "../components/TokenGrid";
import useApolloClient from "../hooks/useApolloClient";
import { gql } from '@apollo/client';
import { TOKENS_QUERY } from "../constants/queries";

function Home() {
  const { account, library } = useWeb3React();


  const isConnected = typeof account === "string" && !!library;

  const [result, setResult] = useState<JSX.Element[]>([]);

  useEffect(() => {
    useApolloClient()
      .query({
        query: gql(TOKENS_QUERY),
      })
      .then((data) => setResult( data.data ))
      .catch((err) => {
        console.log('Error fetching data: ', err)
      })
  },[]);

  return (
    <div>
      <Head>
        <title>Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>

      {isConnected ? (
          <section>
            <TokenGrid data={result} />
          </section>
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
      `}</style>
    </div>
  );
}

export default Home;
