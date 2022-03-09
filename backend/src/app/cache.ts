import model from './db';
import {ICacheModel} from './models/cache'

import { getLogger } from 'log4js';

const logger = getLogger();

export class Cache {
    getCache(ID : string)
    {
        return new Promise((resolve, reject) =>
        {
            model.cache.findOne({contentID: ID}, (err: any, cache: ICacheModel) => 
            {
                if (err) 
                {
                    logger.error(err)
                    reject()
                }
                if (cache)
                    resolve(cache.data)
                else
                    reject()
            })
        })
              
    }

    saveCache(ID : string, data: any)
    {
        let cache: ICacheModel = new model.cache({contentID : ID, data : data});

        return new  Promise((resolve, reject) =>
        {
             model.cache.findOne({contentID: ID}, (err: any, oldData: ICacheModel) => 
            {
                if (err) logger.error(err)
                if (oldData)
                {
                    oldData.data = data
                    oldData.markModified('data');
                    oldData.save().then(newData=>resolve(newData))
                }
                else
                {
                    cache.save().then(newData=>resolve(newData))
                }
            })     
        })   
    }
}
