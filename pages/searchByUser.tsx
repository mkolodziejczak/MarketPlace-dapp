import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import Head from "next/head";
import TokenGrid from "../components/TokenGrid";
import { useRouter } from 'next/router'

function SearchByUser() {
  const { account, library } = useWeb3React();
  const router = useRouter();
  
  const isConnected = typeof account === "string" && !!library;
  const [result, setResult] = useState<JSX.Element[]>([]);


  useEffect(() => {
    console.log(router)
    /*let tokens = JSON.parse(router.query.tokens);
    if( tokens ) {
      setResult( tokens );
    }*/
  },[]);



  return (
    <div>
      <Head>
        <title>Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
      
        <section>
          By User:
          <TokenGrid data={result} />
        </section>

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
