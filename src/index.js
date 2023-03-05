"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nftMethod = void 0;
const initializeKeypair_1 = require("./initializeKeypair");
const web3_js_1 = require("@solana/web3.js");
const js_1 = require("@metaplex-foundation/js");
const fs = __importStar(require("fs"));
// example data for a new NFT
// export const nftData = {
//   name: "Name",
//   symbol: "SYMBOL",
//   description: "Description",
//   sellerFeeBasisPoints: 0,
//   imageFile: "solana.png",
// }
// example data for updating an existing NFT
const updateNftData = {
    name: "Update",
    symbol: "UPDATE",
    description: "Update Description",
    sellerFeeBasisPoints: 100,
    imageFile: "success.png",
};
// helper function to upload image and metadata
function uploadMetadata(metaplex, nftData) {
    return __awaiter(this, void 0, void 0, function* () {
        // file to buffer
        const buffer = fs.readFileSync("src/" + nftData.imageFile);
        // buffer to metaplex file
        const file = (0, js_1.toMetaplexFile)(buffer, nftData.imageFile);
        // upload image and get image uri
        const imageUri = yield metaplex.storage().upload(file);
        console.log("image uri:", imageUri);
        // upload metadata and get metadata uri (off chain metadata)
        const { uri } = yield metaplex.nfts().uploadMetadata({
            name: nftData.name,
            symbol: nftData.symbol,
            description: nftData.description,
            image: imageUri,
        });
        console.log("metadata uri:", uri);
        return uri;
    });
}
// helper function create NFT
function createNft(metaplex, uri, nftData, collectionMint) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nft } = yield metaplex.nfts().create({
            uri: uri,
            name: nftData.name,
            sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
            symbol: nftData.symbol,
            collection: collectionMint,
        }, { commitment: "finalized" });
        console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
        //this is what verifies our collection as a Certified Collection
        yield metaplex.nfts().verifyCollection({
            mintAddress: nft.mint.address,
            collectionMintAddress: collectionMint,
            isSizedCollection: true,
        });
        return nft;
    });
}
function createCollectionNft(metaplex, uri, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { nft } = yield metaplex.nfts().create({
            uri: uri,
            name: data.name,
            sellerFeeBasisPoints: data.sellerFeeBasisPoints,
            symbol: data.symbol,
            isCollection: true,
        }, { commitment: "finalized" });
        console.log(`Collection Mint-koleksiyon: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
        return nft;
    });
}
// helper function update NFT
function updateNftUri(metaplex, uri, mintAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        // fetch NFT data using mint address
        const nft = yield metaplex.nfts().findByMint({ mintAddress });
        // update the NFT metadata
        const { response } = yield metaplex.nfts().update({
            nftOrSft: nft,
            uri: uri,
        }, { commitment: "finalized" });
        console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
        console.log(`Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`);
    });
}
function nftMethod(nftData, method) {
    return __awaiter(this, void 0, void 0, function* () {
        // create a new connection to the cluster's API
        const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
        // initialize a keypair for the user
        const user = yield (0, initializeKeypair_1.initializeKeypair)(connection);
        console.log("PublicKey:", user.publicKey.toBase58());
        // metaplex set up
        const metaplex = js_1.Metaplex.make(connection)
            .use((0, js_1.keypairIdentity)(user))
            .use((0, js_1.bundlrStorage)({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
        }));
        const collectionNftData = {
            name: "TestEnyaresCollectionNFT",
            symbol: "TEST",
            description: "Test Description Collection",
            sellerFeeBasisPoints: 100,
            imageFile: "avatar1.png",
            isCollection: true,
            collectionAuthority: user,
        };
        // upload data for the collection NFT and get the URI for the metadata
        const collectionUri = yield uploadMetadata(metaplex, collectionNftData);
        // create a collection NFT using the helper function and the URI from the metadata
        const collectionNft = yield createCollectionNft(metaplex, collectionUri, collectionNftData);
        // upload the NFT data and get the URI for the metadata
        const uri = yield uploadMetadata(metaplex, nftData);
        // create an NFT using the helper function and the URI from the metadata
        const nft = yield createNft(metaplex, uri, nftData, collectionNft.mint.address);
        if (method === "update") {
            // upload updated NFT data and get the new URI for the metadata
            const updatedUri = yield uploadMetadata(metaplex, updateNftData);
            // update the NFT using the helper function and the new URI from the metadata
            yield updateNftUri(metaplex, updatedUri, nft.address);
        }
    });
}
exports.nftMethod = nftMethod;
// main()
//   .then(() => {
//     console.log("Finished successfully")
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.log(error)
//     process.exit(1)
//   })
