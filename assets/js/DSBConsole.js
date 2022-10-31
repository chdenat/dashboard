import {dsb} from "./dsb.js";

/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : DSBConsole.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  5/27/22, 9:40 AM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/


class DSBConsole {
    #ID = null
    #console = null
    #body = null
    #menu = null
    #last = null
    #scroller = null
    #running=true

    /**
     *
     * @param ID            CSS Selector of the console or DOM Element
     *
     * @param clean         Add the possibility to erase the content
     */
    constructor(ID,clean=true) {

        this.#ID = ID
        if (ID instanceof HTMLElement) {
            this.#console = ID
        } else {
            this.#console = document.querySelector(ID)
        }

        this.#scroller = OverlayScrollbars(this.#console,{})
        this.#console.appendChild(this.#console.getElementsByTagName('console-menu')[0]);


        this.#body = this.#console.querySelector('console-body')
        this.#menu = this.#console.querySelector('console-menu')

        // Hide or manage erase button
        if (clean=== false) {
            this.#menu.querySelector('.console-erase').classList.add('dsb-hide')
        } else {
            this.#menu.querySelector('.console-erase').addEventListener('click',this.clear)
        }

        // Manage Copy button
        this.#menu.querySelector('.console-copy').addEventListener('click',this.copy)

        // Set it ready to print
        this.#prepare_next()

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
        this.#append( from_event ?'':starter, classes)


        if (from_event) {
            starter.preventDefault()

            // We alert the user with a toast
            dsb.toast.message({
                title: dsb.ui.get_text_i18n('console/clear','title'),
                message: dsb.ui.get_text_i18n('console/clear','text'),
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
    copy = async (parameter='') => {
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
            c.style.maxWidth='0px';
            c.style.maxHeight='0px';
            c.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            this.#console.appendChild(c);
            c.focus()
            c.select();
            try {
                document.execCommand("copy");
            }
            catch (e) {
                result = false
            }
            finally {
                this.#console.removeChild(c);
            }
        } else {
            try {
                await navigator.clipboard.writeText(text)
            } catch (e) {
                result = false
            }
        }

        // We alert the user with a toast
        if (result) {
            dsb.toast.message({
                title: dsb.ui.get_text_i18n('console/copy-text','title'),
                message: dsb.ui.get_text_i18n('console/copy-text','text'),
                type: 'success'
            })
        } else {
            dsb.toast.message({
                title: dsb.ui.get_text_i18n('console/copy-text-error','title'),
                message: dsb.ui.get_text_i18n('console/copy-text-error','text'),
                type: 'danger'
            })
        }

    }

    /**
     * Pause the srcolling
     *
     */
    pause = ()=> {
        this.#scroller.sleep()
        this.#console.classList.toggle('pause')

        this.#console.querySelector('.console-play').classList.toggle('dsb-hide')
        this.#console.querySelector('.console-pause').classList.toggle('dsb-hide')
        this.#running=false
    }

    /**
     * Resume the scrolling
     *
     */
    play = ()=> {
        this.#scroller.update()
        this.#console.classList.toggle('pause')

        this.#console.querySelector('.console-play').classList.toggle('dsb-hide')
        this.#console.querySelector('.console-pause').classList.toggle('dsb-hide')
        this.#running=true
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
        this.#console.classList.remove('dsb-hide')
    }

    /**
     * Hide console
     */
    hide = () => {
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
    #append = (text='', classes = '') => {
        if ('' !== text) {
            this.#last.innerHTML = text.replace(/(<br>*)+/g,'<br>')
        }
        if (classes !== '') {
            this.#last.classList.add(classes)
        }

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
        this.#last = document.createElement('console-text')
        this.#body.append(this.#last)
        return this.#last
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

}

export {DSBConsole}