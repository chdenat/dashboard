/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardUtils.js                                                                                           *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 30/07/2023  11:11                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

export class DashboardUtils {

    static findPathInObject = (obj, target) => {
        function helper(obj, target, path) {
            if (typeof obj !== 'object' || obj === null) return null;
            for (const key in obj) {
                const newPath = [...path, key];
                if (obj[key] === target) return newPath;
                const result = helper(obj[key], target, newPath);
                if (result) return result;
            }
            return null;
        }

        return helper(obj, target, []);
    }

    static readJSON = async (file) => {
        // Send the halt command
        return fetch(file, {
            method: 'GET',
        }).then(response => {
            if (!response.ok) {
                throw Error(response.statusText)
            }
            return (response.json())
        })
            .catch(error => {
                    console.error(error)
                    return false
                }
            )
    }
}