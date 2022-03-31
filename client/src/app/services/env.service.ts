import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {environment} from './../../environments/environment';

@Injectable()
export class EnvService { 
    constructor(private http: HttpClient) {}

    private flattenKeyNames(srcKey: string): string {
        const splittedKey: string[] = srcKey.split('/');
        return splittedKey[splittedKey.length - 1];
    }

    fetchVariables(): void {
        console.log('Trying to retrive env variables', `http://localhost:8000/env/get`);
        this.http.get<any>(`http://localhost:8000/env/get`, { 
            params: { etcdPath: "gilda-client" }
        }).subscribe((res: any) => {
            if (res) {
                // Remove the variables names prefixes (/?<etcdPath>/)
                const flattenEnv = {};
                for (const key of Object.keys(res.data)) {
                    const flattenKey: string = this.flattenKeyNames(key);
                    flattenEnv[flattenKey] = res.data[key];
                }
    
                if (this.isInstanceOfIEnv(flattenEnv)) {
                    localStorage.setItem('env', JSON.stringify(flattenEnv));
                    console.log('Got the env variables from the server', res);
                    return;
                } else {
                    throw { description: 'Response not in IEnv structure' };
                }
            }

            throw { description: 'Did not get response from api', data: res };
        },
        (ex) => {
            console.error('Exception occured in loadVariables()', ex);
        });
    }

    private isInstanceOfIEnv(object: any) {
        return 'production' in object && 'apiUrl' in object && 'oAuthProvider' in object && 'clientID' in object;
    }

    getEnvironment(): IEnv {
        const jsonStr: string = localStorage.getItem('env');
        if (jsonStr) {
            const envObj = JSON.parse(jsonStr);

            if (this.isInstanceOfIEnv(envObj)) {
                return envObj;
            }
            
            console.error('Loaded env not from interface IEnv');
        }

        console.error(`There is no 'env' key in localStorage`);
        console.error('Error occured getting default env. Reload the page after new env loaded');
        return environment;
    }
}

export interface IEnv {
    production: boolean;
    apiUrl: string;
    oAuthProvider: string;
    clientID: string;
    userServiceUrl?: string;
}