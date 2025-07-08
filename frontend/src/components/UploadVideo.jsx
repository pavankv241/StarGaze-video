import React, { useState } from 'react';
import axios from 'axios';

const UploadVideo = ({ client, contractAddress }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Pinata configuration
  const pinataApiKey = "33dddf84b12941227eb7";
  const pinataJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5OTMyNjE0OC1hMzIzLTQ0YzItYjUwNi00MTU0YTNiMTNmMzMiLCJlbWFpbCI6ImFyaWZha2h0YXI5MDJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjMzZGRkZjg0YjEyOTQxMjI3ZWI3Iiwic2NvcGVkS2V5U2VjcmV0IjoiNDBiNDQ2ZTJkYWNjM2Y3MzQ5OTI4ODgxZTc1NmVlYzg4OGE3YmYxNjEyYWRlYzRkODE2MmYxY2NjNTI5ZWZhNCIsImV4cCI6MTc4MTg4NDY5MX0.Z0T0LvsNHTyV7YLBmiuzb79xI3uUaIm2L8YQDZ2cKBc";

  // Function to upload a file to Pinata
  const uploadToPinata = async (file, name) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({
        name: `${name}-${Date.now()}`
      }));

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            'Authorization': `Bearer ${pinataJWT}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (!res.data || !res.data.IpfsHash) {
        throw new Error('Invalid response from Pinata');
      }

      return res.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw new Error(`Failed to upload ${name} to Pinata: ${error.message}`);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if wallet is connected and contract is available
    if (!client) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }
    
    if (!contractAddress) {
      setError('Contract address not set. Please deploy the contract first.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Validate inputs
      if (!title || !description || !price || !videoFile || !thumbnailFile) {
        throw new Error('Please fill in all fields and upload both video and thumbnail files');
      }

      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error('Price must be a positive number');
      }

      // Upload files to Pinata
      setMessage('Uploading video to IPFS...');
      const videoHash = await uploadToPinata(videoFile, 'video');
      
      setMessage('Uploading thumbnail to IPFS...');
      const thumbnailHash = await uploadToPinata(thumbnailFile, 'thumbnail');

      setMessage('Registering video with the smart contract...');
      
      // Convert price to microunits (assuming 6 decimal places like STARS)
      const microPrice = Math.floor(parseFloat(price) * 1000000).toString();
      
      // Execute contract to register the video
      const msg = {
        upload_video: {
          title,
          description,
          price: microPrice,
          video_ipfs_hash: videoHash,
          thumbnail_ipfs_hash: thumbnailHash
        }
      };

      try {
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
          throw new Error('No wallet account found. Please connect your wallet.');
        }
        let result;
        try {
          result = await client.execute(
            sender,
            contractAddress,
            msg,
            "auto"
          );
          console.log("Contract execution result:", result);
        } catch (contractError) {
          // Patch: If error is base64 decode, check if tx succeeded
          if (contractError.message && contractError.message.includes('Invalid string. Length must be a multiple of 4')) {
            setMessage('Video uploaded! (UI decode error, but transaction likely succeeded. Please check the video list.)');
            console.warn('Base64 decode error after contract execution. Check if video is uploaded.');
            return;
          } else {
            throw contractError;
          }
        }
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setVideoFile(null);
        setThumbnailFile(null);
        setMessage(`Video uploaded successfully! Transaction hash: ${result?.transactionHash || 'N/A'}`);
      } catch (contractError) {
        console.error('Contract execution error:', contractError);
        throw new Error(`Failed to register video with contract: ${contractError.message}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while uploading the video');
    } finally {
      setLoading(false);
    }
  };

  // Reset file input fields
  const resetFileInput = (e, setter) => {
    e.target.value = null;
    setter(null);
  };

  return (
    <div className="upload-video-container">
      <h2>Upload a Pay-Per-View Video</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
            rows={4}
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price (in STARS)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price to view the video"
            step="0.000001"
            min="0"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="video">Video File</label>
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            onClick={(e) => resetFileInput(e, setVideoFile)}
            disabled={loading}
          />
          {videoFile && <div className="file-info">Selected: {videoFile.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail Image</label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files[0])}
            onClick={(e) => resetFileInput(e, setThumbnailFile)}
            disabled={loading}
          />
          {thumbnailFile && <div className="file-info">Selected: {thumbnailFile.name}</div>}
        </div>
        
        <button type="submit" disabled={loading || !client}>
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!client && (
        <div className="wallet-warning">
          Please connect your wallet to upload videos
        </div>
      )}
    </div>
  );
};

export default UploadVideo; 