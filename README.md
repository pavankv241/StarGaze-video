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

## 🐳 Docker & Stargaze: Issues and Solutions

During the development of this project, we encountered several issues related to Docker, Stargaze testnet deployment, GitHub submodules, and frontend integration. Here's a summary of the problems faced and how they were resolved:

### 1. Docker Build Issues for CosmWasm Contracts
- **Problem:** Errors with permissions, missing dependencies, or output `.wasm` files not being generated/optimized when using `cosmwasm/rust-optimizer`.
- **Solution:**
  - Use the official [cosmwasm/rust-optimizer](https://hub.docker.com/r/cosmwasm/rust-optimizer) image.
  - Run Docker with correct volume mounts and user permissions. Example:
    ```sh
    docker run --rm -v "$(pwd)":/code \
      --mount type=volume,source="$(basename \"$(pwd)\")_cache",target=/code/target \
      --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
      cosmwasm/rust-optimizer:0.14.0
    ```
  - If you get permission errors, run `sudo chown -R $USER:$USER .` on your project directory after building.
  - For Apple Silicon (M1/M2), use the `:0.14.0-arm64` tag.

### 2. Stargaze Testnet Deployment Issues
- **Problem:** Deployment failures due to incorrect chain ID, RPC endpoint, insufficient testnet tokens, or contract instantiation errors.
- **Solution:**
  - Double-check chain ID (`elgafar-1`) and use correct RPC/REST endpoints from [Stargaze docs](https://docs.stargaze.zone/validators/testnet.html).
  - Request testnet tokens from the Stargaze faucet.
  - Wait for contract upload confirmation before instantiating.
  - Use the correct code ID when instantiating.
  - Add Stargaze testnet to Keplr manually if not auto-detected.

### 3. Submodule Issues with GitHub
- **Problem:** Submodules (like `rust-optimizer` or `stargaze`) did not show up as regular folders on GitHub, making them hard to access or link in the README.
- **Solution:**
  - Remove submodule references:
    ```sh
    git rm --cached rust-optimizer
    git rm --cached stargaze
    rm -rf .gitmodules
    ```
  - Add the directories as normal folders:
    ```sh
    cp -r path/to/rust-optimizer .
    cp -r path/to/stargaze .
    git add rust-optimizer stargaze
    git commit -m "Add rust-optimizer and stargaze as regular directories"
    ```
  - Push to GitHub. Now the folders are browsable and linkable in the repo.

### 4. Frontend Wallet/Account Retrieval Issues
- **Problem:** The frontend sometimes failed to retrieve the wallet address from Keplr, causing errors in video upload or pay-to-view flows.
- **Solution:**
  - Implement robust wallet/account fetching logic in the frontend, checking both Keplr and CosmJS clients.
  - Show user-friendly error messages if the wallet is not connected.

### 5. CosmJS Base64 Decode Errors
- **Problem:** Errors like `Invalid string. Length must be a multiple of 4` appeared in the frontend when decoding base64 responses from CosmJS.
- **Solution:**
  - Catch and handle these errors in the frontend.
  - Display a user-friendly message and do not block the user, as these errors are UI-side and do not indicate contract failure.

---

These issues are common when working with CosmWasm, Stargaze, and multi-platform setups. The solutions above should help you (and others) get up and running quickly!

---
