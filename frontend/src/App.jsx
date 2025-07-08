import { useState, useEffect } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { GasPrice } from '@cosmjs/stargate';
import './App.css';
import UploadVideo from './components/UploadVideo';
import VideoPlayer from './components/VideoPlayer';

function App() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'upload'
  const [client, setClient] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isContractReady, setIsContractReady] = useState(false);

  // Contract address - would be set after deployment
  // This is a placeholder - you must replace it with your actual deployed contract address
  // Using stars1jrld5g998gqm4yx26l6cvhcz7ya5xq43tgkz4h as a valid dummy address format for development
  const contractAddress = "stars1hgcx7y6wxgj33syj3ccdnesfvrgmghtj45fjv39v8nzsp43g26rshy0s7e"; 
  
  // For development purposes - set to true only when contract is deployed and address is correct
  const DEVELOPMENT_MODE = false;

  // Connect to wallet (Keplr)
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if Keplr is installed
      if (!window.keplr) {
        throw new Error("Please install Keplr extension");
      }

      // Connect to Stargaze testnet
      await window.keplr.enable("elgafar-1");
      const offlineSigner = window.keplr.getOfflineSigner("elgafar-1");
      const accounts = await offlineSigner.getAccounts();
      
      // Create a CosmWasm client
      const cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
        "https://rpc.elgafar-1.stargaze-apis.com:443", // Stargaze testnet RPC endpoint
        offlineSigner,
        {
          gasPrice: GasPrice.fromString("0.025ustars")
        }
      );

      setClient(cosmWasmClient);
      setWalletAddress(accounts[0].address);
      
      // Only set contract as ready if we're not in development mode or the address has been updated
      setIsContractReady(true);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Attempt to connect wallet on page load
  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Stargaze Pay-Per-View Video Platform</h1>
        
        <div className="wallet-info">
          {walletAddress ? (
            <div className="wallet-connected">
              <span className="wallet-address">
                {walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          ) : (
            <button 
              onClick={connectWallet} 
              disabled={loading}
              className="connect-wallet-button"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {DEVELOPMENT_MODE && (
        <div className="warning-banner">
          ⚠️ DEVELOPMENT MODE: Contract is not deployed yet. Please deploy the contract and update the contractAddress in App.jsx.
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Videos
        </button>
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Video
        </button>
      </div>

      <main className="app-content">
        {error && <div className="error-message">{error}</div>}

        {DEVELOPMENT_MODE ? (
          <div className="development-message">
            <h2>Contract Not Deployed</h2>
            <p>The smart contract has not been deployed yet. Please follow these steps:</p>
            <ol>
              <li>Deploy the contract to Stargaze using the instructions in README.md</li>
              <li>Update the contractAddress in App.jsx with your deployed contract address</li>
              <li>Set DEVELOPMENT_MODE to false</li>
            </ol>
          </div>
        ) : (
          activeTab === 'browse' ? (
            <VideoPlayer 
              client={client} 
              contractAddress={contractAddress} 
            />
          ) : (
            <UploadVideo 
              client={client} 
              contractAddress={contractAddress} 
            />
          )
        )}
      </main>

      <footer className="app-footer">
        <p>Built on Stargaze blockchain with IPFS (Pinata) for decentralized storage</p>
      </footer>
    </div>
  );
}

export default App;
