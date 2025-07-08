use cw20::Cw20ReceiveMsg;
use cw721::Cw721ReceiveMsg;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::state::{Ask, Cw721Deposits, Video};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct InstantiateMsg {
    pub native_denom: String
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Receive(Cw20ReceiveMsg),
    ReceiveNft(Cw721ReceiveMsg),
    PurchaseNative {
        collection: String,
        token_id: String,
    },
    RemoveListing {
        collection: String,
        token_id: String,
    },
    UploadVideo {
        title: String,
        description: String,
        price: u128,
        video_ipfs_hash: String,
        thumbnail_ipfs_hash: String,
    },
    PayForViewNative {
        video_id: u64,
    },
    RemoveVideo {
        video_id: u64,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Cw721Deposits {
        owner: String,
        collection: String,
    },
    Ask {
        collection: String,
        token_id: String,
    },
    GetAllAsks {},
    GetVideo {
        video_id: u64,
    },
    GetAllVideos {},
    CheckVideoAccess {
        video_id: u64,
        viewer: String,
    },
    GetVideosByOwner {
        owner: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct Cw721DepositResponse {
    pub deposits: Vec<(String, Cw721Deposits)>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct AskResponse {
    pub ask: Option<Ask>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct GetAllAsksResponse {
    pub asks: Vec<((String, String), Ask)>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct VideoResponse {
    pub video: Option<Video>,
    pub has_access: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct GetAllVideosResponse {
    pub videos: Vec<Video>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct VideoAccessResponse {
    pub has_access: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub struct OwnerVideosResponse {
    pub videos: Vec<Video>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum MigrateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum Cw20HookMsg {
    Purchase {
        cw721_contract: String,
        token_id: String,
    },
    PayForView {
        video_id: u64,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum Cw721HookMsg {
    SetListing {
        owner: String,
        token_id: String,
        cw20_contract: Option<String>,
        amount: u128,
    },
}
