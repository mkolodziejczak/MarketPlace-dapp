import { JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";

export default async function useSignatureProvider( collectionName: string, collectionAddress: string, tokenId: string, account: JsonRpcSigner, spender: string, nonce ) {
    // Account here is the wallete address// Our Token Contract Nonces
    const deadline = + new Date() + 60 * 60; // Permit with deadline which the permit is valid
      
    const EIP712Domain = [ // array of objects -> properties from the contract and the types of them ircwithPermit
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'verifyingContract', type: 'address' }
    ];

    const domain = {
        name: collectionName,
        version: '1',
        verifyingContract: collectionAddress
    };

    const Permit = [ // array of objects -> properties from erc20withpermit
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
    ];

    const message = {
        owner: account._address, // Wallet Address
        spender: spender, // **This is the address of the spender whe want to give permit to.**
        tokenId: tokenId,
        nonce: nonce.toHexString(),
        deadline
    };

    const data = JSON.stringify({
        types: {
            EIP712Domain,
            Permit
        },
        domain,
        primaryType: 'Permit',
        message
    });

    //const signatureLike = await account.send('eth_signTypedData_v4', [account.address, data]); // Library is a provider.
    const signatureLike = await account._signTypedData(
        domain,
        {
            Permit
        },
        message
    );
    const signature = await ethers.utils.splitSignature(signatureLike);

    const preparedSignature = {
        v: signature.v,
        r: signature.r,
        s: signature.s,
        deadline,
        tokenId
    };

    return preparedSignature;
  }