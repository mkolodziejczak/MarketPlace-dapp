# MarketPlace-dapp

React decentralized app for Marketplace Contract.

Interacts with Goerli contract with address:
0x7D584Ef99988A1dbf6083d53970f8Be0e6bd7A21

Supported by The Graph:
https://api.studio.thegraph.com/query/37975/marketplace-graph/1.6

Source Code for the graph located in separate repository:
https://github.com/mkolodziejczak/MarketPlace-services

Before deployment following properties in constants/index.ts have to be entered:
* walletConnectSupportedNetworks - network rpc URL
* NFT_STORAGE_KEY - API key of Nft.Storage

To run it simply call `npm run dev`
Sets up DApp on localhost:4001
