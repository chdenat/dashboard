/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardConsole.js                                                                                         *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 06/10/2023  19:33                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {dsb} from '/dashboard/assets/js/dsb.js'
import {Bus as ConsoleEvent} from '/dashboard/assets/vendor/EventEmitter/Bus.js'

//import {OverlayScrollbars} from 'overlayscrollbars'

class DashboardConsole {
    static event = ConsoleEvent
    #id = null
    #console = null
    #body = null
    #menu = null
    #last = null
    #scroller = null
    #running = true
    #marker = 'data-next-entry'

    /**
     *
     * @param id            CSS Selector of the console or DOM Element
     *
     * @param clean         Add the possibility to erase the content
     */
    constructor(id, clean = true) {

        this.#id = id
        if (id instanceof HTMLElement) {
            this.#console = id
        } else {
            this.#console = document.querySelector(id)
        }

        this.#scroller = OverlayScrollbars(this.#console, {})
        this.#console.appendChild(this.#console.getElementsByTagName('console-menu')[0]);


        this.#body = this.#console.querySelector('console-body')
        this.#menu = this.#console.querySelector('console-menu')

        // Hide or manage erase button
        if (clean === false) {
            this.#menu.querySelector('.console-erase').classList.add('dsb-hide')
        } else {
            this.#menu.querySelector('.console-erase').addEventListener('click', this.clear)
        }

        // Manage Copy button
        this.#menu.querySelector('.console-copy').addEventListener('click', this.copy)
        // Manage Export button
        this.#menu.querySelector('.console-export').addEventListener('click', this.export)

        // Set it ready to print
        this.#prepare_next()
        DashboardConsole.event.emit(`console/start/${this.#id}`)
    }

    /**
     * Get last console-text element
     *
     * @returns {null}
     */
    get last() {
        return this.#last
    }

    /**
     * Get all the console content
     *
     * @returns {string}
     */
    get text() {
        return this.#body.innerText
    }

    /**
     * Get the console CSS selector
     *
     * @returns console selector
     */
    get console() {
        return this.#console
    }

    /**
     * Get the running status
     *
     * @returns {null}
     */

    get running() {
        return this.#running
    }

    /**
     * Return id
     * @return {null}
     */
    get id() {
        return this.#id
    }

    /**
     * Clear the console and initiate the new content with  'starter'
     *
     * @param starter The content to add (default nothing)
     *                This function can also be called by a click event (to erase content interactively)
     *
     * @param classes classes to add
     */
    clear = (starter = '', classes = '') => {
        // check the caller
        const from_event = starter instanceof Event

        this.#body.innerHTML = ''
        this.#prepare_next()
        this.#append(from_event ? '' : starter, classes)

        DashboardConsole.event.emit(`console/clear/${this.#id}`)

        if (from_event) {
            starter.preventDefault()

            // We alert the user with a toast
            dsb.toast.message({
                title: dsb.ui.get_text_i18n('console/clear', 'title'),
                message: dsb.ui.get_text_i18n('console/clear', 'text'),
                type: 'success'
            })
        }
    }

    /**
     * Copy console content to the clipboard
     *
     * @param parameter             parameter could be an event
     * @returns {Promise<void>}
     */
    copy = async (parameter = '') => {
        const from_event = parameter instanceof Event
        if (from_event) {
            parameter.preventDefault()
        }

        const text = this.#body.innerText
        let result = true;

        // If Clipboard API not available,we use the textarea workaround
        if (!navigator.clipboard) {
            let c = document.createElement("textarea");
            c.value = text;
            c.style.maxWidth = '0px';
            c.style.maxHeight = '0px';
            c.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            this.#console.appendChild(c);
            c.focus()
            c.select();
            try {
                document.execCommand("copy");
            } catch (e) {
                result = false
            } finally {
                this.#console.removeChild(c);
            }
        } else {
            try {
                await navigator.clipboard.writeText(text)
            } catch (e) {
                result = false
            }
        }

        DashboardConsole.event.emit(`console/copy/${this.#id}`, [{result: result}])


        // We alert the user with a toast
        if (result) {
            dsb.toast.message({
                title: dsb.ui.get_text_i18n('console/copy-text', 'title'),
                message: dsb.ui.get_text_i18n('console/copy-text', 'text'),
                type: 'success'
            })
        } else {
            dsb.toast.message({
                title: dsb.ui.get_text_i18n('console/copy-text-error', 'title'),
                message: dsb.ui.get_text_i18n('console/copy-text-error', 'text'),
                type: 'danger'
            })
        }

    }

    /**
     * export console content to a file
     *
     * @param parameter             parameter could be an event
     * @returns {Promise<void>}
     */
    export = (parameter) => {
        const from_event = parameter instanceof Event
        if (from_event) {
            parameter.preventDefault()
        }

        dsb.utils.export_to_file(this.#body.innerText, 'console.txt')

        DashboardConsole.event.emit(`console/export/${this.#id}`)

        // We alert the user with a toast
        dsb.toast.message({
            title: dsb.ui.get_text_i18n('console/export-text', 'title'),
            message: dsb.ui.get_text_i18n('console/export-text', 'text'),
            type: 'success'
        })

    }

    /**
     * Pause the srcolling
     *
     */
    pause = () => {
        this.#scroller.sleep()
        this.#console.classList.toggle('pause')
        this.#running = false

        DashboardConsole.event.emit(`console/pause/${this.#id}`, [{running: this.#running}])

        this.#console.querySelector('.console-play').classList.toggle('dsb-hide')
        this.#console.querySelector('.console-pause').classList.toggle('dsb-hide')
    }

    /**
     * Resume the scrolling
     *
     */
    play = () => {
        this.#scroller.update()
        this.#console.classList.toggle('pause')
        this.#running = true

        DashboardConsole.event.emit(`console/play/${this.#id}`, [{running: this.#running}])

        this.#console.querySelector('.console-play').classList.toggle('dsb-hide')
        this.#console.querySelector('.console-pause').classList.toggle('dsb-hide')
    }

    /***
     * Log method.
     *
     * @param text    Text to add
     * @param classes classes to add
     * @param clear   Clear console before (default false)
     *
     */
    log = (text, classes = '', clear = false) => {

        if (clear) {
            this.clear(text, classes)
        } else {
            this.#append(text, classes)
        }
    }

    /**
     * Show console
     */
    show = () => {
        DashboardConsole.event.emit(`console/show/${this.#id}`)
        this.#console.classList.remove('dsb-hide')
    }

    /**
     * Hide console
     */
    hide = () => {
        DashboardConsole.event.emit(`console/hide/${this.#id}`)
        this.#console.classList.add('dsb-hide')
    }

    /**
     * Append text to the last console-body element and create a new one
     *
     * @param text      text to add
     * @param classes   classes to add
     * @returns the last element
     *
     *
     */
    #append = (text = '', classes = '') => {
        if ('' !== text) {
            this.#last.innerHTML = text.replace(/(<br>*)+/g, '<br>')
        }
        if (classes !== '') {
            this.#last.classList.add(classes)
        }

        this.#last.removeAttribute(this.#marker)
        DashboardConsole.event.emit(`console/append/${this.#id}`)

        return this.#prepare_next()
    }

    /**
     * Add a new empty console-text element
     *
     * @param classes   classes to add
     *
     * @returns  the last element
     */
    #prepare_next = (classes = '') => {
        const alreadyDone = this.#body.querySelector(`console-text[${this.#marker}]`)
        if (alreadyDone) {
            this.#last = alreadyDone
        } else {
            this.#last = document.createElement('console-text')

        }
        this.#last.setAttribute(this.#marker, true)
        this.#body.append(this.#last)
        return this.#last
    }

}

export {DashboardConsole}