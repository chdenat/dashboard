/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DSBFormUtils.js                                                                                             *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 21/07/2023  19:34                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/


export class DSBFormUtils {

    static detectChange = (form, callable) => {
        // get form
        if (typeof form == "string") form = document.getElementById(form);
        if (!form || !form.nodeName || form.nodeName.toLowerCase() != "form") return null;

        let children = Array.from(form.elements)
        children.forEach(child => {
            switch (child.nodeName.toLowerCase()) {
                case 'select':
                case 'textarea':
                case 'input':
                    ['change', 'keyup', 'paste'].forEach(type => {
                        child.addEventListener(type, event => {
                            callable.call()
                        })
                    })
            }
        })

    }

    /**
     * Prepare post with form data.
     *
     * @param form  form object
     *
     * @returns  object  of form elements  where name = aaa--bbb
     *
     * @since 1.0
     *
     */
    static prepare = (form) => {
        let data = {}
        let array = [...form.elements]
        array.forEach(element => {
            if ((element.type === 'radio' && element.checked) || (element.type !== 'radio' && element.type !== 'fieldset'
                && element.name !== '')) {
                const [chapter, name] = element.name.split('--')
                let value = element.value.trim()
                if (['true', 'on'].includes(value.toLowerCase())) {
                    value = true
                } else if (['false', 'off'].includes(value.toLowerCase())) {
                    value = false
                }
                if (name !== undefined) {
                    if (!data.hasOwnProperty(chapter)) {
                        data[chapter] = {}
                    }
                    data[chapter][name] = value
                } else {
                    data[element.name] = value
                }
            }
        })

        return data
    }

}