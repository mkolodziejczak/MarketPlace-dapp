import React from 'react'
import Link from 'next/link'
import useEagerConnect from "../hooks/useEagerConnect";
import Account from "./Account";
import { useEffect, useState } from "react";

const Navbar = () => {
  const triedToEagerConnect = useEagerConnect();


  useEffect(() => {
    
  },[]);

    return (
      <div className="NavBar">
        <nav>
          <ul>
            <Link href="/">
            <li><a>Home</a></li>
            </Link>
            <Link href="/mintItem">
            <li><a>Mint</a></li>
            </Link>
            <Link href="/createCollection">
            <li><a>Collection</a></li>
            </Link>
            <Link href="/profile">
            <li><a>Profile</a></li>
            </Link>
            <Account triedToEagerConnect={triedToEagerConnect} />
          
          </ul>
        </nav>
    </div>
    )
}
 
export default Navbar