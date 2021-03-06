import { Router, Request, Response, NextFunction } from "express";
import { ETCDConfig } from '../configs/etcd.config';
import { Etcd3 } from 'etcd3';
import { getLogger } from "log4js";

const logger = getLogger();
const router: Router = Router();

router.get('/get', async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    logger.info('Getting env');
    const clientServicePath: string = req.query.etcdPath.toString();

    if (!clientServicePath) 
        return res.status(400).json({ description: 'Cannot make this request without etcdPath param' });

    // Checking if this prefix is public (permitted to send)
    if (clientServicePath.toLocaleLowerCase() !== process.env.ETCD_PUBLIC_DIR_PREFIX.toLocaleLowerCase())
        return res.status(405).json({ description: 'This etcd prefix not permitted' });

    try {
        const etcdClient: Etcd3 = ETCDConfig.client;
        logger.info(`Trying to retrive all keys contains prefix of: ${clientServicePath} from etcd`);
        let values = await etcdClient.getAll().prefix(clientServicePath).strings();
        
        if (clientServicePath[0] !== '/') {
            logger.info(`There is no '/' at the beginnig, trying to retrive key: /${clientServicePath} too`);
            const moreHits = await etcdClient.getAll().prefix(`/${clientServicePath}`).strings();   
            values = { ...moreHits, ...values };
        }
        
        logger.info('Retrived values', values);
        return res.status(200).json({ data: values });
    } catch(ex) {
        return res.status(500).json({ description: 'Error occurd', ex });
    }
})

.post('/test', async (req: Request, res: Response): Promise<Response> => {
    logger.info('Testing env');
    try {
        const etcdClient: Etcd3 = ETCDConfig.client;

        await etcdClient.put('angular-tst/a').value('bar');
        await etcdClient.put('angular-tst/b').value('bar2');
        
        logger.info(`Trying to retrive all keys contains prefix of: angular-tst from etcd`);
        const values = await etcdClient.getAll().prefix('angular-tst').strings();
        logger.info('Retrived values', values);

        res.status(200).json({ data: values });
    } catch(ex) {
        return res.status(500).json({ description: 'Exception caught', ex });
    }
})

export default router;