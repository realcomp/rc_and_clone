/**
 * Created by maxim on 18.10.16.
 */


'use strict';


/**
 * Класс для работы с localStorage браузера
 */
export class LocalStorage {


    /**
     *
     * @param property
     * @param value
     */
    static set(property: string, value: any) {
        value = value || {};
        var valueJSON = JSON.stringify(value);
        window.localStorage.setItem(property, valueJSON);
    }


    /**
     *
     * @param property
     * @returns {null}
     */
    static get(property: string) {
        var object = window.localStorage.getItem(property);
        return object == null ? null : JSON.parse(object);
    }


    /**
     *
     * @param property
     */
    static remove(property: string) {
        window.localStorage.removeItem(property);
    }

}