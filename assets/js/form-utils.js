/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : form-utils.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  4/3/22, 7:37 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/

let detect_change = (form, callable) => {
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
export {detect_change}

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
let prepare_to_post = (form) => {
    let data = {}
    let array = [...form.elements]
    array.forEach(element => {
        if (element.name.includes('--')) {
            if ((element.type === 'radio' && element.checked) || element.type !== 'radio') {
                data[element.name] = element.value.trim();
            }
        }
    })

    return data
}

export {prepare_to_post}