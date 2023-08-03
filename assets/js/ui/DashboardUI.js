/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardUI.js                                                                                              *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 02/08/2023  19:17                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {Block} from '/dashboard/assets/js/Block.js'
import {DashboardUtils as Utils} from '/dashboard/assets/js/DashboardUtils.js'
import {DashboardLangManager} from '/dashboard/assets/js/ui/DashboardLangManager.js'
import {DashboardMenu as Menu} from '/dashboard/assets/js/ui/DashboardMenu.js'

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

    static encodeHTMLEntities = (text) => {
        var textArea = document.createElement('textarea');
        textArea.innerText = text;
        return textArea.innerHTML;
    }
    static  decodeHTMLEntities = (text) => {
        var textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
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
        if (element != null && element !== undefined) {
            if (!Array.isArray(element)) {
                const old = element
                element = []
                element.push(old)
            }

            element.forEach(item => {
                item?.classList.add(this.FETCHING_CLASS)
            })
        }
    }

    static stopFetchingAnimation = (element) => {
        if (element != null && element !== undefined) {
            if (!Array.isArray(element)) {
                const old = element
                element = []
                element.push(old)
            }

            element.forEach(item => {
                item.classList.remove(this.FETCHING_CLASS)
            })
        }
    }

    static isFetchingAnimationInProgress = (element) => {
        if (element != null && element !== undefined) {
            return element.classList.contains(this.FETCHING_CLASS)
        }
        return false
    }

    static startButtonAnimation = (button) => {
        // Bail early
        if (button === null) {
            return
        }
        if (button instanceof UIEvent) {
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
        if (button instanceof UIEvent) {
            button = button.target
        }

        dsb.ui.show(button.querySelector('.animation.start')).hide(button.querySelector('.animation.doing'))
        button.classList.remove('animation', 'doing')


    }
    static isButtonAnimationRunning = (button) => {
        // Bail early
        if (button === null) {
            return
        }
        if (button instanceof UIEvent) {
            button = button.target
        }

        return button.classList.contains('doing')

    }

    static exportChartToSVG = async (chart, fileName = 'sample') => {
        try {
            let tmp = chart.ctx.exports.w.config.chart.toolbar.export.svg.filename
            chart.ctx.exports.w.config.chart.toolbar.export.svg.filename = fileName
            chart.ctx.exports.exportToSVG(chart.ctx, {fileName: fileName})
            chart.ctx.exports.w.config.chart.toolbar.export.svg.filename = tmp

            dsb.toast.message({
                title: dsb.ui.get_text_i18n('chart/svg', 'title'),
                message: sprintf(dsb.ui.get_text_i18n('chart/svg', 'text'), fileName),
                type: 'success',
            })

            return true
        } catch (e) {
            dsb.toast.message({
                title: dsb.ui.get_text_i18n('chart/svg', 'title'),
                message: sprintf(dsb.ui.get_text_i18n('chart/svg', 'error'), fileName),
                type: 'danger',
            })
            return false
        }
    }

    /**
     *  Apex Chart export svg
     *
     * @param chart
     * @param series
     * @param fileName
     * @return {Promise<boolean>}
     */
    static exportChartToCSV = async (chart, series, fileName = 'sample') => {
        try {
            chart.ctx.exports.exportToCSV({
                series: series,
                columnDelimiter: ',',
                fileName: fileName,
            })

            dsb.toast.message({
                title: dsb.ui.get_text_i18n('chart/csv', 'title'),
                message: sprintf(dsb.ui.get_text_i18n('chart/csv', 'text'), fileName),
                type: 'success',
            })

            return true
        } catch (e) {

            dsb.toast.message({
                title: dsb.ui.get_text_i18n('chart/csv', 'title'),
                message: sprintf(dsb.ui.get_text_i18n('chart/csv', 'error'), fileName),
                type: 'danger',
            })

            return false
        }
    }

    /**
     *
     * @param variable  Variable name without --
     * @return {string}
     */
    static getCSSVariable = (variable) => {
        return window.getComputedStyle(document.documentElement).getPropertyValue('--' + variable).trim()
    }

    /**
     *
     * @param variable Variable name without --
     * @param value
     *
     * @return {{void}}
     */

    static setCSSVariable = (variable, value) => {
        document.documentElement.style.setProperty('--' + variable, value)
    }

    /**
     * Set page title
     *
     * @param title if set, page title is "MAIN : title" else (default) it is "MAIN"
     *
     * @since 1.0
     */
    static setTitle = (title = null) => {
        // Null => we use standard page title
        if (title === null) {
            document.title = dsb.page.main_title
            return
        }
        // It's a string, we use it
        if (typeof title === 'string') {
            document.title = `${dsb.page.main_title}: ${title}`
            return
        }
        // It's a link, we search in the menu settings
        const path = Utils.findPathInObject(Menu.json, title.getAttribute('href'))
        if (null !== path) {
            let current = Menu.json
            path.forEach(child => {
                current = current[child]
                if (current.text !== undefined) {
                    let text = current.text
                    // If there is some translation, get it instead
                    if (dsb.language?.current && current.lang[dsb.language.current]) {
                        text = current.lang[dsb.language.current]
                    }
                    document.title = text

                }
            })
        }
    }

    static setBreadcrumbs = (item = null) => {

        if (dsb.language === undefined) {
            dsb.language = new DashboardLangManager()
        }

        let href

        if (typeof item === 'string') {
            href = item
        } else if (item instanceof Block) {
            href = item.file
        } else {
            href = item.getAttribute('href')
        }

        const path = Utils.findPathInObject(Menu.json, href)

        let current = Menu.json
        let breadcrumb = []

        if (null !== path) {

            path.forEach(child => {
                current = current[child]
                if (current.text !== undefined) {
                    let text = current.text
                    // If there is some translation, get it instead
                    if (dsb.language?.current && current.lang[dsb.language.current]) {
                        text = current.lang[dsb.language.current]
                    }
                    breadcrumb.push(text)
                }
            })


            // Show Text
            document.getElementById('breadcrumbs').innerHTML = '<i class="fa-regular fa-house"></i>'
                + breadcrumb.join('<i class="fa-regular fa-chevron-right"></i>'
                )
        }

    }

    static disable = (element) => {
        if (!(element instanceof HTMLElement)) {
            element = document.querySelector(stick)
            if (stick === null) {
                element
            }
        }

        element.classList.add('disabled')
        element.setAttribute('disabled', '')
    }
    static enable = (element) => {
        if (!(element instanceof HTMLElement)) {
            element = document.querySelector(stick)
            if (stick === null) {
                element
            }
        }

        element.classList.remove('disabled')
        element.removeAttribute('disabled')

    }
}