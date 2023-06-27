/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardUtils.js                                                                                           *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 27/06/2023  17:49                                                                                *
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
}