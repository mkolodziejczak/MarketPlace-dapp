import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import getLibrary from "../getLibrary";
import Navbar from '../components/Navbar'
import "../styles/globals.css";

function NextWeb3App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Navbar />
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default NextWeb3App;
