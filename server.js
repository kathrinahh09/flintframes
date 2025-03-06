import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
const FLINTFRAMES_CONTRACT_ADDRESS = process.env.FLINTFRAMES_CONTRACT_ADDRESS;

app.post('/verify-nft', async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required." });
    }

    try {
        const response = await axios.get(
            `https://api.opensea.io/api/v2/chain/matic/account/${walletAddress}/nfts`,
            {
                headers: { 'x-api-key': OPENSEA_API_KEY }
            }
        );

        const nfts = response.data.nfts || [];
        const ownsFlintFramesNFT = nfts.some(nft => nft.contract === FLINTFRAMES_CONTRACT_ADDRESS);

        if (ownsFlintFramesNFT) {
            return res.json({ verified: true, message: "NFT ownership verified!" });
        } else {
            return res.status(403).json({ verified: false, message: "No FlintFrames NFT found in this wallet." });
        }
    } catch (error) {
        console.error("Error verifying NFT:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to verify NFT ownership." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});