import express from 'express';
import {v4} from 'uuid'
import {v2} from 'cloudinary'

const cloudinary = v2;
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

const initiateImageUpload = async (req, res) => {
  try {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const public_id = v4();
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      public_id
    }, process.env.CLOUDINARY_SECRET);
    
    return res.status(200).send({ timestamp, signature, public_id });
  } catch (e) {
    console.log(e)
    return res.status(500).send({ success: false, error: e });
    
  }
}


router.get("/initiateImageUpload", initiateImageUpload);

export default router;
