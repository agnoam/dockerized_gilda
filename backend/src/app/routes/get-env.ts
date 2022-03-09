import { Router, Request, Response, NextFunction } from "express";
import { ETCDConfig } from '../configs/etcd.config';
import { Etcd3 } from 'etcd3';
import { getLogger } from "log4js";

const logger = getLogger();
const router: Router = Router();

router.post('/get', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const clientServicePath: string = req.body.etcdPath;

    try {
        const etcdClient: Etcd3 = ETCDConfig.client;
        
        logger.info(`Trying to retrive all keys contains prefix of: ${clientServicePath} from etcd`);
        const values = await etcdClient.getAll().prefix(clientServicePath).strings();
        
        logger.info('Retrived values');
        res.status(200).json({ data: values });
    } catch(ex) {
        return res.status(500).json({ description: 'Error occurd', ex });
    }
})

.post('/test', async (req: Request, res: Response) => {
    try {
        const etcdClient: Etcd3 = ETCDConfig.client;

        await etcdClient.put('angular-tst/a').value('bar');
        await etcdClient.put('angular-tst/b').value('bar2');
        
        logger.info(`Trying to retrive all keys contains prefix of: angular-tst from etcd`);
        const values = await etcdClient.getAll().prefix('angular-tst').strings();
        logger.info('Retrived values');

        res.status(200).json({ data: values });
    } catch(ex) {
        return res.status(500).json({ description: 'Exception caught', ex });
    }
})

export default router;