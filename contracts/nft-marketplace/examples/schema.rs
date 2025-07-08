use std::env::current_dir;
use std::fs::create_dir_all;

use cosmwasm_schema::{export_schema, remove_schemas, schema_for};

use nft_marketplace::msg::{
    ExecuteMsg, InstantiateMsg, QueryMsg, Cw20HookMsg, Cw721HookMsg, 
    GetAllAsksResponse, AskResponse, Cw721DepositResponse,
    VideoResponse, GetAllVideosResponse, VideoAccessResponse, OwnerVideosResponse,
};
use nft_marketplace::state::{Ask, Cw721Deposits, Video};

fn main() {
    let mut out_dir = current_dir().unwrap();
    out_dir.push("schema");
    create_dir_all(&out_dir).unwrap();
    remove_schemas(&out_dir).unwrap();

    export_schema(&schema_for!(InstantiateMsg), &out_dir);
    export_schema(&schema_for!(ExecuteMsg), &out_dir);
    export_schema(&schema_for!(QueryMsg), &out_dir);
    export_schema(&schema_for!(Cw20HookMsg), &out_dir);
    export_schema(&schema_for!(Cw721HookMsg), &out_dir);
    export_schema(&schema_for!(AskResponse), &out_dir);
    export_schema(&schema_for!(GetAllAsksResponse), &out_dir);
    export_schema(&schema_for!(Cw721DepositResponse), &out_dir);
    export_schema(&schema_for!(Ask), &out_dir);
    export_schema(&schema_for!(Cw721Deposits), &out_dir);
    
    // Add exports for pay-per-view video system
    export_schema(&schema_for!(Video), &out_dir);
    export_schema(&schema_for!(VideoResponse), &out_dir);
    export_schema(&schema_for!(GetAllVideosResponse), &out_dir);
    export_schema(&schema_for!(VideoAccessResponse), &out_dir);
    export_schema(&schema_for!(OwnerVideosResponse), &out_dir);
}
