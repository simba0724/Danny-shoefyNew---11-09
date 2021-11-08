import React from 'react';

const WalletContext = React.createContext(null);

export const withWallet = Component => props => (
  <WalletContext.Consumer>
    {wallet => <Component {...props} wallet={wallet} />}
  </WalletContext.Consumer>
);

export default WalletContext;