import * as React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from "react";
import TokenContent from './TokenContent';
import { Metadata, ContractToken, Token } from '../constants/types';

type TokenData = {
    data: ContractToken[];
  };

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const TokenGrid = ({ data }: TokenData) => {
  const [tokens, setTokens] = useState<Token[]>([]);

  async function getMetadataFromUrl( url: string) {
    const metadata = url.replace('ipfs://', 'https://ipfs.io/ipfs/');

    try {
      let response = await fetch(metadata);
      const responseJson : Metadata = await response.json();
      return responseJson;
     } catch(error) {
    }
  }
  
  async function processToken(token: ContractToken) {
    let metadata: Metadata = await getMetadataFromUrl(token.uri);

    let splitFilePath = metadata.image.split("/");
    let encodedFileName = encodeURIComponent(splitFilePath[3]);
    splitFilePath[3] = encodedFileName;
    let imageUrl = splitFilePath.join("/").replace("ipfs://", "https://ipfs.io/ipfs/");

    return new Token(metadata, token, imageUrl);
  }

  useEffect(() => {

    const processTokens = async(data) => {
      let tokensArray = [];
      for (const token of data) {
        if( token.uri != "" ) {
          let newToken: Token = await processToken(token);
          tokensArray.push(newToken);
        }
      }
      setTokens(tokensArray);
    };
    processTokens(data);
  },[]);


  return (
    <Box sx={{ flexGrow: 1 }}>

        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
        {tokens.map((token: Token, index) => (
          <Grid item xs={2} sm={4} md={4} key={index}>
            <Item>
              <TokenContent token={token} />
            </Item>
          </Grid>
        ))}
      </Grid >
    </Box>

  );
};
export default TokenGrid;