use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use cosmwasm_std::{Addr, Uint128};
use cw_storage_plus::{Item, Map};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub native_denom: String
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Cw721Deposits {
    pub owner: String,
    pub collection: String,
    pub token_id: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Ask {
    pub collection: String,
    pub token_id: String,
    pub seller: String,
    pub price: Uint128,
    pub cw20_contract: Option<String>,
}

// New struct for pay-per-view video system
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Video {
    pub id: u64,
    pub owner: String,
    pub title: String,
    pub description: String,
    pub price: Uint128,
    pub video_ipfs_hash: String,
    pub thumbnail_ipfs_hash: String,
}

pub const CONFIG: Item<Config> = Item::new("config");
//contract, owner, token_id
pub const CW721_DEPOSITS: Map<(&str, &str, &str), Cw721Deposits> = Map::new("cw721deposits");

//key can be cw721_contract, token_id
pub const ASKS: Map<(&str, &str), Ask> = Map::new("asks");

// New storage for pay-per-view video system
pub const VIDEOS: Map<u64, Video> = Map::new("videos");
pub const VIDEO_COUNT: Item<u64> = Item::new("video_count");
// Maps (video_id, viewer_addr) -> has_access
pub const VIDEO_ACCESS: Map<(u64, &Addr), bool> = Map::new("video_access");
