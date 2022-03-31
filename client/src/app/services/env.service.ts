import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class EnvService { 
    constructor(private http: HttpClient) {}

    async loadVariables(): Promise<any> {
        try {
            console.log('Trying to retrive env variables');
            const res = await this.http.post(`/api/env/get`, {
                etcdPath: "gilda-client"
            }).toPromise();
    
            // TODO: Remove the variables names prefixes (/?<etcdPath>/)
            console.log('Got the env variables from the server', res);
        } catch (ex) {
            console.error('Exception occured in loadVariables()', ex);
        }
    }
}

export interface IEnv {
    production: boolean;
    apiUrl: string;
    oAuthProvider: string;
    clientID: string;
    userServiceUrl?: string;
}