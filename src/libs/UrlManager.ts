/**
 * Created by maxim on 18.10.16.
 */


'use strict';



export class UrlManager {


    /**
     *
     * @param url
     * @param params
     * @returns {*}
     */
    static createUrlWithParams(url: string, params?: any) {
        if (params == null) {
            return url;
        }

        let result = url;
        let index = 0;

        for (let param in params) {

            // null type string - special label for ignore params
            if (params.hasOwnProperty(param) && params[param] != null) {
                result += index === 0 ? (url.indexOf('?') === -1 ? '?' : '&') : '&';
                result += `${param}=${params[param]}`;
                index++;
            }
        }

        return result;
    }

}