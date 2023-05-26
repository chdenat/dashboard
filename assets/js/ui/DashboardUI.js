/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardUI.js                                                                                              *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 26/05/2023  09:05                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/


export class DashboardUI {

    static BACKDROP_ELEMENT = document.getElementById('dsb-backdrop')
    static FETCHING_CLASS = 'fetching'

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
     * @param elements
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


    static managePassword = () => {
        document.querySelectorAll('.input-group.password .toggle-password').forEach(item => {
            item.addEventListener('click', this.togglePassword)
        })
    }

    static togglePassword = (event) => {
        const eye = event.currentTarget
        const password = document.querySelector(`[name="${event.currentTarget.dataset.password}"]`)
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password'

        password.setAttribute('type', type)
        eye.querySelector('.show-password').classList.toggle('dsb-hide')
        eye.querySelector('.hide-password').classList.toggle('dsb-hide')
    }


    static showOverlay = (opacity) => {
        this.BACKDROP_ELEMENT.classList.add('show')
        if (opacity) {
            this.BACKDROP_ELEMENT.style.opacity = opacity
        }
    }
    static hideOverlay = () => {
        this.BACKDROP_ELEMENT.classList.remove('show')
    }

    /**
     *
     * @param stick {{HTMLElement:any}}
     * @param value in percentage
     * @param label text in stick
     * @param type danger|warning|success,  default to primary
     */
    static setStickInfo = ({stick, value, label = '', type = 'primary'}) => {
        if (stick !== null) {
            if (!(stick instanceof HTMLElement)) {
                stick = document.querySelector(stick)
                if (stick === null) {
                    return
                }
            }

            const container = stick.querySelector('span')
            container.style.minWidth = `${value}%`
            if (value === 0 || value === 'NaN') {
                container.innerHTML = '&nbsp;'
                container.style.opacity = 0

            } else {
                container.innerHTML = label
                container.style.opacity = 1

                stick.classList.add(type)
            }

        }
        return stick

    }

    static startFetchingAnimation = (element) => {

        if (!Array.isArray(element)) {
            const old = element
            element = []
            element.push(old)
        }

        element.forEach(item => {
            item.classList.add(this.FETCHING_CLASS)
        })
    }

    static stopFetchingAnimation = (element) => {
        if (!Array.isArray(element)) {
            const old = element
            element = []
            element.push(old)
        }

        element.forEach(item => {
            item.classList.remove(this.FETCHING_CLASS)
        })
    }

    static isFetchingAnimationInProgress = (element) => {
        return element.classList.contains(this.FETCHING_CLASS)
    }

    static startButtonAnimation = (button) => {
        // Bail early
        if (button === null) {
            return
        }
        if (button instanceof PointerEvent) {
            button = button.target
        }

        button.classList.add('animation', 'doing')
        dsb.ui.hide(button.querySelector('.animation.start')).show(button.querySelector('.animation.doing'))
    }

    static stopButtonAnimation = (button) => {
        // Bail early
        if (button === null) {
            return
        }
        if (button instanceof PointerEvent) {
            button = button.target
        }


        dsb.ui.show(button.querySelector('.animation.start')).hide(button.querySelector('.animation.doing'))
        button.classList.remove('animation', 'doing')


    }

}