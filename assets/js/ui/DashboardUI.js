/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardUI.js                                                                                              *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 11/03/2023  18:01                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/


export class DashboardUI {
    /**
     * For all elements that have the class alert-support-access, we change the criteria (primary, secondary...)
     *
     * @param criteria
     */
    static changeElementType = (criteria = null, _class = '') => {
        ['alert', 'text'].forEach(elementType => {
            DashboardUI.setElementType(document.querySelectorAll(`.${_class}`), elementType, criteria)
        })
    }

    /**
     * Remove all <prefix>-<something> classes
     *
     * @param element
     * @param prefix
     */
    static resetElementType(element, prefix = DashboardUI.DEFAULT_PREFIX) {
        DashboardUI.setElementType(element, prefix)
    }

    /**
     * Change all classes that are used to type an element (ie primary, secondary, success ...
     * in other words change all that are matching <prefix>-<something> by <prefix>-<criteria>
     *
     * If there is <prefix> class but no <prefix>-<something>,we add <prefix>-<criteria> class
     *
     * @param element {HTMLElement|string}
     * @param prefix {string}
     * @param criteria  {string} if null, all <prefix>-<something> classes are removed
     *
     * @return DashboardUI for chaining
     */
    static setElementType = (elements, prefix, criteria) => {

        if (!(elements instanceof NodeList)) {
            elements = [elements]
        }

        const regex = new RegExp(`^(${prefix}-)([a-z]*)$`)

        elements.forEach(element => {
            let _new = []
            // Try to work with en HTMLElement
            if (!(element instanceof HTMLElement)) {
                element = document.getElementById(element)
            }
            let found = false
            element.classList.forEach(_class => {
                if (criteria !== null) {
                    if (regex.test(_class)) {
                        _class = _class.replace(regex, `$1${criteria}`)
                        found = true
                    }
                    _new.push(_class)
                }
            })

            if (!found && element.classList.contains(prefix) && criteria != null) {
                _new.push('${prefix}-${criteria}')
            }

            element.className = _new.join(' ')
        })
        return DashboardUI
    }


}