import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Head from "next/head";
import TokenGrid from "../components/TokenGrid";
import { useRouter } from 'next/router'
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay'

function SearchByUser() {
  const { account, library } = useWeb3React();
  const router = useRouter();
  
  const [loading, setLoading] = useState<boolean>(true);
  const isConnected = typeof account === "string" && !!library;
  const [result, setResult] = useState<JSX.Element[]>([]);


  useEffect(() => {
    let params = router.query.tokens;
    let tokens = JSON.parse(params.toString());
    if( tokens ) {
      setResult( tokens );
    }
    setLoading(false);
  },[router.query]);



  return (
    <div>
      <Head>
        <title>Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
      {loading && (
          <div>
              <CircleSpinnerOverlay
              　　loading={loading} 
              overlayColor="rgba(0,153,255,0.2)"
              />
          </div>
        )}
      {isConnected && !loading ? (
        <section>
          By User
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

export default SearchByUser;
