import { Etcd3, IKeyValue, IOptions as IETCDOptions, WatchBuilder, Watcher } from 'etcd3';
import { getLogger } from 'log4js';
// import dotenv from 'dotenv';
// dotenv.config();

/**
 * @author Noam Aghai
 * This module used for loading environment variables from ETCD server instead of `.env` or 
 * specificly mention in environment variables of the system.
 * 
 * This configuration can:
 * - Setting parameters by `.env` variables
 * - Getting paramaters threw ETCD
 * - Watch for changes on the paramaters loaded from ETCD
 * - Override `process.env` object
 * 
 * Parameters fallback is:
 * - Trying to load the wanted parameters directly from ETCD
 * - Loading additional variables from `.env` file (default configs `dotenv`)
 * - Loading the variables from the system (node)
 * 
 * All parameters get a copy inside envParams object
 */
export module ETCDConfig {
    const logger = getLogger();
    export let client: Etcd3 = null;
    let _configs: IETCDConfigurations;
    let _etcdWatcher: WatchBuilder = null;
    export let envParams: IEnvParams = null;

    const defaultConfigs: IETCDConfigurations = {
        envParams: {},
        configs: {
            dirname: process.env.ETCD_SERVICE_NAME || 'default-service-name'
        }
    }

    /**
     * @description This function creates a client to be to communicate with the etcd server
     * @param connectionOptions Connection options by the etcd3 library
     */
    const createClient = (connectionOptions?: IETCDOptions): void => {
        if (!client) {
            logger.info('Creating client with parameters', connectionOptions);
            client = new Etcd3(connectionOptions);
            console.log('ETCD client has been created');
        }
    }

    /**
     * @description Initialization of `process.env` variable with the data came from the ETCD
     * 
     * @param connectionOptions ETCD connection options
     * @param configs Configurations for the `process.env` setting
     */
    export const initialize = async (connectionOptions: IETCDOptions, configs: IETCDConfigurations): Promise<void> => {
        try {
            if (!configs.configs.dirname) 
                configs.configs.dirname = defaultConfigs.configs.dirname;

            _configs = { ...defaultConfigs, ...configs };
            logger.info('Loaded etcd configs', _configs);

            createClient(connectionOptions);
            _etcdWatcher = client.watch();

            if (!_configs.configs?.dirname) 
                throw 'ETCD_SERVICE_NAME not found in environment variables';
            if (!_configs?.envParams || !Object.keys(_configs?.envParams).length) 
                throw 'Configs arg does not contains any properties';

            await initializeProcess();
        } catch (ex) {
            console.error('initialize() ex:', ex);
        }
    }


    /**
     * @description Getting the setting of an property declared in @IETCDConfigurations if exists
     * @param propertyName Wanted property name
     * @returns The settings in case they exist
     */
    const getPropertySetting = (propertyName: string): IETCDPropertySetting => {
        if (typeof _configs.envParams[propertyName] !== "object")
            return undefined;

        return _configs.envParams[propertyName] as IETCDPropertySetting;
    }


    /**
     * @description Update the env variables (self-managed and process.env)
     * 
     * @param propertyName The propertyName to set in the variables
     * @param val The new value
     */
    const updateEnv = (propertyName: string, val: any) => {
        if (_configs.configs.overrideSysObj && process.env[propertyName] != val) {
            console.log('Update new key in process.env');
            process.env[propertyName] = val;
        }

        // Saving a copy in self-managed object
        envParams[propertyName] = val;
    }

    /**
     * @description Watching for key changes in ETCD
     * 
     * @param key The key to watch
     * @param propertyName The propertyName to put in env (or `process.env`)
     */
    const watchForChanges = (key: string | Buffer, propertyName: string): void => {
        if (!_etcdWatcher) throw 'There is no ETCD client, initialization is required';
        
        _etcdWatcher.key(key).create().then((watcher: Watcher) => {
            watcher.on("put", (kv: IKeyValue, previous?: IKeyValue) => {
                console.log(`Updating the ${key} to:`, kv.value.toString());
                updateEnv(propertyName, kv.value.toString());
            });

            watcher.on("delete", async (kv: IKeyValue, previous?: IKeyValue) => {
                console.log(`Deleting param: ${propertyName} from envs`);
                if (envParams)
                    delete envParams[propertyName];
                
                if (_configs.configs?.overrideSysObj)
                    delete process.env[propertyName];

                // In case the key deleted,
                await watcher.cancel();
            });
        });
    }

    /**
     * @description Initializing `process.env` property keys
     */
    const initializeProcess = async (): Promise<void> => {
        for (const propertyName of Object.keys(_configs?.envParams)) {
            const propertySetting: IETCDPropertySetting = getPropertySetting(propertyName);
            const generatedEtcdPath: string = `${_configs.configs.dirname}/${propertyName}`;
            const etcdEntryName: string = propertySetting?.etcdPath || generatedEtcdPath;
            
            // Checking the etcd entry exists. in case it does it will be set, else it will be the defaultValue
            const val = await client.get(etcdEntryName).string();
            const strDefaultVal: string | null | undefined = _configs.envParams[propertyName] !== '[object Object]' ? 
                _configs.envParams[propertyName]?.toString() : undefined;
            
            if (_configs.configs?.overrideSysObj) {
                process.env[propertyName] = process.env[propertyName] || val || propertySetting?.defaultValue || strDefaultVal;
                console.log(`process.env[${propertyName}]:`, process.env[propertyName]);

                if (!envParams) envParams = {};
                envParams[propertyName] = process.env[propertyName] || val || propertySetting?.defaultValue || strDefaultVal;

                if (_configs.configs?.watchKeys)
                    watchForChanges(etcdEntryName, propertyName);
            }

            if (!val && _configs.configs?.genKeys) {
                logger.info(`Writing new key to etcd because it's not exists`);
                await client.put(etcdEntryName).value(process.env[propertyName]);
            } 
        }
    }
}

interface IETCDSettings {
    /**
     * @description The default "directory" (static-prefix) to search in keys, and save them
     */
    dirname?: string | Buffer;
    
    /**
     * @description Generating the keys if not exists in etcd by the given `defaultValue`. default false 
     */
    genKeys?: boolean;

    /**
     * @description Override the `process.env.${key}` with the data gathered from etcd. Otherwise, env will be accessed by `ETCDConfig.envParams`
     */
    overrideSysObj?: boolean;
    
    /**
     * @description Watch the keys for change and update
     */
    watchKeys?: boolean;
}

interface IETCDPropertySetting {
    /**
     * @description Custom etcd path to retrive the value from
     */
    etcdPath: string;

    /**
     * @description Default value to put in case it not exists
     */
    defaultValue?: string;
}

export interface IETCDConfigurations {
    configs?: IETCDSettings;
    envParams: {
        // If the value is string, it's the defaultValue
        [propertyName: string]: IETCDPropertySetting | string;
    }
}

export interface IEnvParams {
    [keyName: string]: any;
}