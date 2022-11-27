import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Account from "../components/Account";
import NativeCurrencyBalance from "../components/NativeCurrencyBalance";
import TokenGrid from "../components/TokenGrid";
import useEagerConnect from "../hooks/useEagerConnect";
import useApolloClient from "../hooks/useApolloClient";
import { gql } from '@apollo/client';
import { TOKENS_QUERY } from "../constants/queries";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import MintItem from "./mintItem";

function Home() {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

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
  });

  return (
    <div>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
      <Router>
        <nav>
          <Link href="/">
            <a>Home</a>
          </Link>
          <Link href="/mintItem">
            <a>Mint</a>
          </Link>
          <Link href="/createCollection">
            <a>Collection</a>
          </Link>
          <Link href="/profile">
            <a>Profile</a>
          </Link>

          <Account triedToEagerConnect={triedToEagerConnect} />
        </nav>
        <Switch>
          <Route path="/mintItem">
            <MintItem contractAddress={""} />
          </Route>
          <Route path="/createCollection">
            <MintItem contractAddress={""} />
          </Route>
          <Route path="/profile">
            <MintItem contractAddress={""} />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
        </Router>
      </header>

      <main>
        <h1>
          This is NFT Market Place
        </h1>
        <h2>
          You can use this marketplace to create, buy & sell NFTs
        </h2>
        <TokenGrid data={result} />
        {isConnected && (
          <section>
            <NativeCurrencyBalance />

            
          </section>
        )}
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
