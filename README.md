# Stargaze Pay-Per-View Video Platform

A decentralized pay-per-view video platform built on Stargaze (CosmWasm) and React, with IPFS (Pinata) for decentralized storage.

---

## Features

- Upload videos and thumbnails to IPFS via Pinata
- List videos for pay-per-view access
- Pay to watch videos using $STARS (Stargaze testnet)
- Wallet integration (Keplr)
- Smart contract written in Rust (CosmWasm)
- Frontend in React

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for contract builds)
- [Keplr Wallet](https://www.keplr.app/) browser extension
- [Git](https://git-scm.com/)

---

## Quick Start

### 1. Clone the Repository

```sh
git clone https://github.com/pavankv241/StarGaze-video.git
cd StarGaze-video
```

---

### 2. Build and Deploy the Smart Contract

> **Note:** If you only want to use the frontend with an already deployed contract, skip to step 3.

#### a. Build the contract (using Docker)

```sh
cd cosmosPPV-main/contracts/nft-marketplace
docker run --rm -v $(pwd):/code --mount type=volume,source=$(basename $(pwd))_cache,target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/workspace-optimizer:0.12.11
```

The optimized `.wasm` file will be in the `artifacts/` directory.

#### b. Deploy to Stargaze Testnet

- [Get testnet $STARS](https://faucet.elgafar-1.stargaze-apis.com/)
- Install [starsd CLI](https://docs.stargaze.zone/develop/quickstart.html)
- Upload and instantiate the contract:

```sh
starsd tx wasm store artifacts/nft_marketplace.wasm --from <your_wallet> --chain-id elgafar-1 --node https://rpc.elgafar-1.stargaze-apis.com:443 --fees 5000ustars --gas auto --yes
# Note the code_id from the output

starsd tx wasm instantiate <code_id> '{"owner":"<your_wallet_address>","native_denom":"ustars"}' --from <your_wallet> --label "nft-marketplace" --admin <your_wallet_address> --chain-id elgafar-1 --node https://rpc.elgafar-1.stargaze-apis.com:443 --fees 5000ustars --gas auto --yes
# Note the contract address from the output
```

---

### 3. Configure the Frontend

#### a. Set the contract address

Edit `frontend/src/App.jsx` and set:
```js
const contractAddress = "stars1..."; // your deployed contract address
```

#### b. Set the network to Stargaze testnet

Make sure the chain ID is `elgafar-1` and the RPC endpoint is `https://rpc.elgafar-1.stargaze-apis.com:443`.

---

### 4. Run the Frontend

```sh
cd frontend
yarn install   # or npm install
yarn dev       # or npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 5. Using the App

- Connect your Keplr wallet (set to Stargaze testnet)
- Upload videos (files are pinned to IPFS via Pinata)
- Pay to watch videos using $STARS

---

## Troubleshooting

- **Keplr not connecting?** Make sure you're on the Stargaze testnet (`elgafar-1`).
- **Docker build issues?** Ensure Docker Desktop is running.
- **Contract errors?** Check the Stargaze block explorer or use `starsd query tx <txhash> ...` for logs.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## License

MIT

---

## Stargaze Testnet Resources

- [Stargaze Docs](https://docs.stargaze.zone/)
- [Testnet Faucet](https://faucet.elgafar-1.stargaze-apis.com/)
- [Block Explorer](https://testnet-explorer.publicawesome.dev/stargaze)

---
