import ImageKit from 'imagekit';
import { Request, Response } from 'express';
import { config } from 'dotenv';
config();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGE_KIT_URL,
});

const getImageAuth = async (req: Request, res: Response): Promise<void> => {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.send({ ...authenticationParameters });
};

export { getImageAuth };
