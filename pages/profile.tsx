import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Head from "next/head";
import TokenGrid from "../components/TokenGrid";
import useApolloClient from "../hooks/useApolloClient";
import { gql } from '@apollo/client';
import { USER_TOKENS_QUERY } from "../constants/queries";
import UserActions from "../components/UserActions";
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay'

function Profile() {
  const { account, library } = useWeb3React();
  
  const isConnected = typeof account === "string" && !!library;
  const [result, setResult] = useState<JSX.Element[]>([]);
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    setLoading(true);
    if ( account ) {
      console.log(account);
      useApolloClient()
        .query({
          query: gql(USER_TOKENS_QUERY),
          variables: {
            userAddress: account.toLowerCase(),
          },
        })
        .then((data) => setVariables(data.data))
        .catch((err) => {
          console.log('Error fetching data: ', err)
        })
    }
  },[account]);

  const setVariables = (data:Object) => {
    if( data.user ) {
      setResult(data.user.tokens);
    }
    setLoading(false)
  }

  return (
    <div>
      <Head>
        <title>Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {loading && (
          <div>
              <CircleSpinnerOverlay
              　　loading={loading} 
              overlayColor="rgba(0,153,255,0.2)"
              />
          </div>
        )}
      <main>
      <UserActions/>
      {isConnected && !loading ? (
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
