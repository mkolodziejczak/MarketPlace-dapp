import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Head from "next/head";
import TokenGrid from "../components/TokenGrid";
import useApolloClient from "../hooks/useApolloClient";
import { gql } from '@apollo/client';
import { USER_TOKENS_QUERY } from "../constants/queries";

function Profile() {
  const { account, library } = useWeb3React();
  
  const isConnected = typeof account === "string" && !!library;
  const [result, setResult] = useState<JSX.Element[]>([]);


  useEffect(() => {
    if( isConnected ) {
    useApolloClient()
      .query({
        query: gql(USER_TOKENS_QUERY),
        variables: {
          userAddress: account,
        },
      })
      .then((data) => setResult( data.data.tokens ))
      .catch((err) => {
        console.log('Error fetching data: ', err)
      })
    }
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
          Profile
          <div>
            {account}
          </div>
          <TokenGrid data={result} />
        </section>
        ) : (
          <div>
            <h2>
              Connect to see your profile.
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

export default Profile;
