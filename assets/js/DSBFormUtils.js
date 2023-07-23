/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DSBFormUtils.js                                                                                             *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 23/07/2023  12:06                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

/**
 * HTMLFormElement prototype function to call a functon when a change hase been detected in a form
 *
 * @param callable : callback function
 *
 */
const DSBFormDetectChange = function (callable) {
    this.addEventListener('input', (event) => {
        callable.call(null, this, event.target)   // this is the form, event.target the element we just changed
    });
}

export {DSBFormDetectChange}

/**
 * HTMLFormElement prototype function to extract a form data to an object
 *
 * Detect all named element and create an object :
 *     {
 *         name1 : value1,
 *         name2 : value2
 *     }
 *
 * If name is in the forma <xxxx>--<yyyy> we create en attributes - object xxx (if does not exist) with attributes yyy
 *
 *    {
 *        name1:value1,
 *        ...
 *        xxx:{
 *               yyy:value
 *        }
 *    }
 *
 * @param flat   used to flat the object (alle elements at the same level (use carefully as some attributes can have the same name
 *
 *    Flat on (with xxx-yyy named element)  :
 *    {
 *        name1:value1,
 *        ...
 *        yyy:value
 *
 *    }
 *
 * @return {{}}
 *
 */
const DSBFormExtractToObject = function (flat = false) {
    let data = {}
    let array = [...this.elements]
    array.forEach(element => {
        if ((element.type === 'radio' && element.checked) || (element.type !== 'radio' && element.type !== 'fieldset'
            && element.name !== '')) {
            const [chapter, name] = element.name.split('--')
            let value = element.value.trim()
            if (['true', 'on', true, '1'].includes(value.toLowerCase())) {
                value = true
            } else if (['false', 'off', false, ''].includes(value.toLowerCase())) {
                value = false
            }
            if (name !== undefined) {
                if (flat) {
                    data[name] = value
                } else {
                    if (!data.hasOwnProperty(chapter)) {
                        data[chapter] = {}
                    }
                    data[chapter][name] = value
                }
            } else {
                    data[element.name] = value
                }
            }
        })

        return data
    }
export {DSBFormExtractToObject}