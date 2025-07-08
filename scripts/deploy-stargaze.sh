#!/bin/bash
set -e

# Compile the contracts
echo "🔧 Compiling the contracts..."
cargo wasm

# Optimize the contract (produces artifacts/nft_marketplace.wasm)
echo "⚙️ Optimizing the contract..."
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.11

# Deploy to Stargaze network
echo "🚀 Deploying the contract to Stargaze network..."
WASM_FILE="artifacts/nft_marketplace.wasm"

# Check if the WASM file exists
if [ ! -f "$WASM_FILE" ]; then
  echo "❌ Error: $WASM_FILE does not exist!"
  exit 1
fi

# Make sure you have the stargaze binary and it's configured
# You can replace this with the actual command to deploy on Stargaze
echo "Using stargaze CLI to store and instantiate contract..."

# Example (replace with actual commands):
# Store the contract code
STORE_RESULT=$(starsd tx wasm store $WASM_FILE \
  --from wallet \
  --chain-id stargaze-1 \
  --gas-prices 0.025ustars \
  --gas auto \
  --gas-adjustment 1.3 \
  -y \
  --output json)

# Extract the code ID
CODE_ID=$(echo $STORE_RESULT | jq -r '.logs[0].events[] | select(.type=="store_code") | .attributes[] | select(.key=="code_id") | .value')
echo "✅ Contract stored with code ID: $CODE_ID"

# Instantiate the contract
INIT_MSG='{"native_denom":"ustars"}'
INSTANTIATE_RESULT=$(starsd tx wasm instantiate $CODE_ID "$INIT_MSG" \
  --from wallet \
  --chain-id stargaze-1 \
  --label "Pay-Per-View Video Platform" \
  --gas-prices 0.025ustars \
  --gas auto \
  --gas-adjustment 1.3 \
  --no-admin \
  -y \
  --output json)

# Extract the contract address
CONTRACT_ADDRESS=$(echo $INSTANTIATE_RESULT | jq -r '.logs[0].events[] | select(.type=="instantiate") | .attributes[] | select(.key=="contract_address") | .value')

echo "🎉 Contract deployed successfully!"
echo "Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "Update your frontend with this contract address." 