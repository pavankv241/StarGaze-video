# PowerShell script to deploy the contract to Stargaze network
# Make sure you have starsd CLI installed and configured

# Set variables
$WASM_FILE = "artifacts/nft_marketplace.wasm"
$CHAIN_ID = "stargaze-1"
$GAS_PRICES = "0.025ustars"
$WALLET = "arif akhtar" # Replace with your wallet name

# Check if the WASM file exists
if (-not (Test-Path $WASM_FILE)) {
    Write-Error "Error: $WASM_FILE does not exist!"
    exit 1
}

Write-Host "🚀 Deploying the contract to Stargaze network..."

# Store the contract code
Write-Host "Storing contract code..."
$STORE_CMD = "starsd tx wasm store $WASM_FILE --from $WALLET --chain-id $CHAIN_ID --gas-prices $GAS_PRICES --gas auto --gas-adjustment 1.3 -y --output json"
Write-Host "Running: $STORE_CMD"
Write-Host "Please execute this command in your terminal and note the code ID from the output."

# Wait for user to input the code ID
$CODE_ID = Read-Host "Enter the code ID from the store transaction"

# Instantiate the contract
$INIT_MSG = '{"native_denom":"ustars"}'
$INSTANTIATE_CMD = "starsd tx wasm instantiate $CODE_ID '$INIT_MSG' --from $WALLET --chain-id $CHAIN_ID --label 'Pay-Per-View Video Platform' --gas-prices $GAS_PRICES --gas auto --gas-adjustment 1.3 --no-admin -y --output json"
Write-Host "Running: $INSTANTIATE_CMD"
Write-Host "Please execute this command in your terminal and note the contract address from the output."

# Wait for user to input the contract address
$CONTRACT_ADDRESS = Read-Host "Enter the contract address from the instantiate transaction"

Write-Host "🎉 Contract deployed successfully!"
Write-Host "Contract Address: $CONTRACT_ADDRESS"
Write-Host ""
Write-Host "Update your frontend with this contract address in frontend/src/App.jsx:"
Write-Host "1. Change the contractAddress variable to: '$CONTRACT_ADDRESS'"
Write-Host "2. Set DEVELOPMENT_MODE to false" 