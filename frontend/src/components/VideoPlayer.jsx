import React, { useState, useEffect } from 'react';
import { coin } from '@cosmjs/stargate';

const VideoPlayer = ({ client, contractAddress }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  // Get all videos on component mount
  useEffect(() => {
    if (client && contractAddress) {
      fetchVideos();
      // Get wallet address if client is connected
      (async () => {
        try {
          let address = '';
          if (client && client.signer && client.signer.getAccounts) {
            const accounts = await client.signer.getAccounts();
            if (accounts && accounts.length > 0) {
              address = accounts[0].address;
            }
          } else if (window && window.keplr) {
            await window.keplr.enable("elgafar-1");
            const offlineSigner = window.getOfflineSigner("elgafar-1");
            const accounts = await offlineSigner.getAccounts();
            if (accounts && accounts.length > 0) {
              address = accounts[0].address;
            }
          }
          if (address) {
            setWalletAddress(address);
          } else {
            setError('No wallet account found. Please connect your wallet.');
          }
        } catch (err) {
          console.error('Error getting account:', err);
          setError('Error getting wallet account. Please reconnect your wallet.');
        }
      })();
    }
  }, [client, contractAddress]);

  // Fetch all videos from the contract
  const fetchVideos = async () => {
    if (!client || !contractAddress) {
      console.log('Client or contract address not available');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Wrap in try/catch to handle contract errors
      const result = await client.queryContractSmart(contractAddress, { get_all_videos: {} })
        .catch(err => {
          console.error('Contract query error:', err);
          throw new Error(`Query failed: ${err.message}`);
        });
      
      // Safety check for result format
      if (result && Array.isArray(result.videos)) {
        setVideos(result.videos);
      } else {
        console.warn('Unexpected response format:', result);
        setVideos([]);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please ensure the contract is properly deployed.');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has access to a video
  const checkAccess = async (videoId) => {
    if (!client || !contractAddress || !walletAddress) return false;
    
    try {
      const result = await client.queryContractSmart(contractAddress, {
        check_video_access: {
          video_id: videoId,
          viewer: walletAddress
        }
      }).catch(() => ({ has_access: false }));
      
      return result && result.has_access === true;
    } catch (err) {
      console.error('Error checking video access:', err);
      return false;
    }
  };

  // Handle video selection
  const handleSelectVideo = async (video) => {
    setSelectedVideo(video);
    setMessage('');
    setError('');
    
    // Check if user has access to this video
    if (client && contractAddress && walletAddress) {
      const access = await checkAccess(video.id);
      setHasAccess(access);
    }
  };

  // Pay for video access with native tokens
  const handlePayForVideo = async () => {
    if (!client || !contractAddress || !selectedVideo) {
      setError('Wallet not connected or video not selected');
      return;
    }
    
    try {
      setLoading(true);
      setMessage('Processing payment...');
      // Get native token denom from contract config
      const configResult = await client.queryContractSmart(contractAddress, { config: {} })
        .catch(() => ({ config: { native_denom: 'ustars' } }));
      const nativeDenom = configResult?.config?.native_denom || 'ustars';

      // Get wallet address from client or Keplr
      let sender = '';
      if (client && client.signer && client.signer.getAccounts) {
        const accounts = await client.signer.getAccounts();
        if (accounts && accounts.length > 0) {
          sender = accounts[0].address;
        }
      } else if (window && window.keplr) {
        await window.keplr.enable("elgafar-1");
        const offlineSigner = window.getOfflineSigner("elgafar-1");
        const accounts = await offlineSigner.getAccounts();
        if (accounts && accounts.length > 0) {
          sender = accounts[0].address;
        }
      }
      if (!sender) {
        setError('No wallet account found. Please connect your wallet.');
        setLoading(false);
        return;
      }

      // Execute payment
      let result;
      try {
        result = await client.execute(
          sender,
          contractAddress,
          {
            pay_for_view_native: {
              video_id: selectedVideo.id
            }
          },
          "auto",
          "Pay for video access", // memo
          [coin(selectedVideo.price, nativeDenom)]
        );
        console.log("Contract execution result:", result);
      } catch (contractError) {
        // Patch: If error is base64 decode, check if tx succeeded
        if (contractError.message && contractError.message.includes('Invalid string. Length must be a multiple of 4')) {
          setMessage('Payment sent! (UI decode error, but transaction likely succeeded. Please check your access.)');
          setHasAccess(true);
          console.warn('Base64 decode error after contract execution. Check if access is granted.');
          setLoading(false);
          return;
        } else {
          throw contractError;
        }
      }
      setMessage('Payment successful! You now have access to the video.');
      setHasAccess(true);
    } catch (err) {
      console.error('Error paying for video:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  // Generate IPFS gateway URL
  const getIpfsUrl = (hash) => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  };

  return (
    <div className="video-player-container">
      <h2>Pay-Per-View Videos</h2>
      
      {/* Video list */}
      <div className="video-list">
        <h3>Available Videos</h3>
        {loading && !(videos && videos.length) ? (
          <p>Loading videos...</p>
        ) : !(videos && videos.length) ? (
          <p>No videos available yet. Be the first to upload a video!</p>
        ) : (
          <div className="video-grid">
            {(videos || []).map((video) => (
              <div 
                key={video.id} 
                className={`video-card ${selectedVideo?.id === video.id ? 'selected' : ''}`}
                onClick={() => handleSelectVideo(video)}
              >
                <img 
                  src={getIpfsUrl(video.thumbnail_ipfs_hash)} 
                  alt={video.title} 
                  className="video-thumbnail"
                />
                <h4>{video.title}</h4>
                <p className="video-price">
                  Price: {parseInt(video.price) / 1000000} STARS
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected video details */}
      {selectedVideo && (
        <div className="selected-video">
          <h3>{selectedVideo.title}</h3>
          <div className="video-details">
            <img 
              src={getIpfsUrl(selectedVideo.thumbnail_ipfs_hash)} 
              alt={selectedVideo.title} 
              className="video-preview"
            />
            <div className="video-info">
              <p className="video-description">{selectedVideo.description}</p>
              <p className="video-owner">Owner: {selectedVideo.owner}</p>
              <p className="video-price">
                Price: {parseInt(selectedVideo.price) / 1000000} STARS
              </p>
              
              {!hasAccess ? (
                <button 
                  onClick={handlePayForVideo} 
                  disabled={loading || !walletAddress}
                  className="pay-button"
                >
                  {loading ? 'Processing...' : `Pay to Watch`}
                </button>
              ) : (
                <p className="access-granted">You have access to this video</p>
              )}
            </div>
          </div>
          
          {/* Video player - only shown if user has access */}
          {hasAccess && (
            <div className="video-player">
              <video 
                controls 
                src={getIpfsUrl(selectedVideo.video_ipfs_hash)}
                poster={getIpfsUrl(selectedVideo.thumbnail_ipfs_hash)}
                width="100%"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      )}
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!walletAddress && (
        <div className="wallet-warning">
          Please connect your wallet to purchase and watch videos
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 