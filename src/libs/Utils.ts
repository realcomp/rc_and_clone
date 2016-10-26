/**
 * Created by maxim on 18.10.16.
 */


'use strict'


export class Utils {


    /**
     *
     * @param eventName
     * @param detail
     * @returns {CustomEvent}
     */
    static factoryCustomEvents(eventName, detail = {}) {
        return new CustomEvent(eventName, {
            bubbles: true,
            detail: detail
        });
    }


    /**
     *
     * @param target
     * @param objects
     * @returns {*}
     */
    static extend(target, objects) {

        for (var object in objects) {
            if (objects.hasOwnProperty(object)) {
                recursiveMerge(target, objects[object]);
            }
        }

        function recursiveMerge(target, object) {
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    var current = object[property];
                    if (Utils.getConstructor(current) === 'Object') {
                        if (!target[property]) {
                            target[property] = {};
                        }
                        recursiveMerge(target[property], current);
                    }
                    else {
                        target[property] = current;
                    }
                }
            }
        }

        return target;
    }


    /**
     *
     * @param object
     * @returns {string}
     */
    static getConstructor(object) {
        return Object.prototype.toString.call(object).slice(8, -1);
    }


    /**
     *
     * @param json
     * @returns {*}
     */
    static jsonParse(json) {
        let result = null;
        try {
            result = JSON.parse(json);
        }
        catch (e) {
            throw new Error(e);
        }

        return result;
    }


    /**
     *
     * @param date
     * @returns {*}
     */
    static dateFormatting(date) {
        let result = '';
        if(typeof date === 'string') {

            let dateNative = new Date(date);
            if(isNaN(dateNative.getDate())) {
                return date;
            }

            let day = dateNative.getDate();
            let dayResult = day.toString();
            if(day < 10) {
                dayResult = '0' + dayResult;
            }

            let month = dateNative.getMonth() + 1;
            let monthResult = month.toString();
            if(month < 10) {
                monthResult = '0' + monthResult;
            }

            result = dayResult + '.' + monthResult + '.' + dateNative.getFullYear().toString();
        }

        return result;
    }


    /**
     *
     * @param func
     * @param ms
     * @returns {Function}
     */
    static debounce(func, ms) {
        var state = null;
        var COOLDOWN = 1;
        return function() {
            if (state) {
                return;
            }

            func.apply(this, arguments);
            state = COOLDOWN;

            setTimeout(function() {
                state = null
            }, ms);
        }
    }


    /**
     *
     * @param fields
     * @returns {function(any, any): *}
     */
    static sortBy (...fields) {
        return function(A, B) {
            var a, b, field, key, reverse, result;
            for (var i = 0, l = fields.length; i < l; i++) {
                result = 0;
                field = fields[i];

                key = typeof field === 'string' ? field : field.name;

                a = A[key];
                b = B[key];

                reverse = (field.reverse) ? -1 : 1;

                if (a < b) result = reverse * -1;
                if (a > b) result = reverse * 1;
                if (result !== 0) break;
            }
            return result;
        }
    }


    /**
     *
     * @param number
     * @param titles
     * @returns {any}
     */
    static declOfNum(number:any, titles:any) {
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }


}