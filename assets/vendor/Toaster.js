/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Toaster.js                                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 08/07/2023  11:44                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {Toast} from "bootstrap"


/**
 * TODO: Dark Mode
 */

/**
 * Toaster constructor
 *
 */
export class Toaster {

    /**
     * Toast positions
     *
     * @type {{
     *  TOP_START: string,
     *  CENTER: string,
     *  BOTTOM_START: string,
     *  BOTTOM_CENTER: string,
     *  TOP_CENTER: string,
     *  BOTTOM_END: string,
     *  CENTER_START: string,
     *  TOP_END: string,
     *  CENTER_END: string
     * }}
     */
    static position = {
        TOP_START: "top-0 start-0",
        TOP_CENTER: "top-0 start-50 translate-middle-x",
        TOP_END: "top-0 end-0",
        BOTTOM_START: "bottom-0 start-0",
        BOTTOM_CENTER: "bottom-0 start-50 translate-middle-x",
        BOTTOM_END: "bottom-0 end-0", // Default
        CENTER_START: "top-50 start-0 translate-middle-y",
        CENTER_END: "top-50 end-0 translate-middle-y",
        CENTER: "top-50 start-50 translate-middle",
    }
    /**
     * Toast types
     *
     * @type {{
     *  DANGER: string,
     *  SUCCESS: string,
     *  DARK: string,
     *  PRIMARY: string,
     *  INFO: string,
     *  WARNING: string,
     *  DEFAULT: string
     * }}
     */
    static type = {
        DEFAULT: "secondary", // Default
        PRIMARY: "primary",
        INFO: "info",
        SUCCESS: "success",
        WARNING: "warning",
        DANGER: "danger",
        DARK: "dark",
    }

    /**
     * Toast timer
     *
     * @type {{
     *  DISABLED: number,
     *  COUNTDOWN: number,
     *  ELAPSED: number
     * }}
     */
    static timer = {
        DISABLED: 0,
        ELAPSED: 1, // Default
        COUNTDOWN: 2,
    }
    /**
     * Default values
     *
     * @type {{
     *  ANIMATION: boolean, 
     *  CONTAINER: string, 
     *  TEMPLATE: string, 
     *  ICON: string, 
     *  DELAY: number
     * }}
     */
    #default = {
        /**
         * Default delay (ms)
         * @type {number}
         */
        DELAY: 5000,
        /**
         * Default animation
         *
         * @type {boolean}
         */
        ANIMATION: true,
        /**
         * Default icon markup
         *
         * @type {string}
         */
        ICON: `<i class="p-2 me-2 rounded %TYPE%"></i>`,
        /**
         * Default container template
         *
         * @type {string}
         */
        CONTAINER: `<div data-bs-toaster="" class="toast-container #position-fixed m-3" aria-live="polite" style="z-index:999999"></div>`,
        /**
         * Default toast template
         *
         * @type {string}
         */
        TEMPLATE: `
<div class="toast fade" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
        <span class="bs-toaster-icon d-flex">%ICON%</span>
        <strong class="bs-toaster-title me-auto">%TITLE%</strong>
        <small class="bs-toaster-timer text-muted">%TIMER%</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="bs-toaster-text toast-body">
        %TEXT%
        <div class="bs-toaster-buttons">%BUTTONS%</div>
    </div>
</div>
`,
        /**
         * Default texts used in timer
         */
        TEXTS: {
            justNow: 'Just now',
            second: 's',
            minute: 'm'
        }
    }

    /**
     * Private variables
     */
    #container = this.#default.CONTAINER
    #position = Toaster.position.BOTTOM_END
    #type = Toaster.type.DEFAULT
    #timer = Toaster.timer.COUNTDOWN
    #delay = this.#default.DELAY
    #animation = this.#default.ANIMATION
    #icon = this.#default.ICON
    #template = this.#default.TEMPLATE
    #texts = this.#default.TEXTS
    #templateNode = null
    #toastContainer = null

    constructor(
        options = {
            container: this.#default.CONTAINER,
            position: Toaster.position.BOTTOM_END,
            type: Toaster.type.DEFAULT,
            timer: Toaster.timer.COUNTDOWN,
            delay: this.#default.DELAY,
            icon: this.#default.ICON,
            animation: this.#default.ANIMATION,
            template: this.#default.TEMPLATE,
            texts: this.#default.TEXTS
        }
    ) {
        this.#container = options.container ?? this.#default.CONTAINER
        this.#position = options.position ?? Toaster.position.BOTTOM_END
        this.#type = options.type ?? Toaster.type.DEFAULT
        this.#timer = options.timer ?? Toaster.timer.COUNTDOWN
        this.#animation = options.animation ?? this.#default.ANIMATION
        this.#delay = options.delay ?? this.#default.DELAY
        this.#icon = options.icon ?? this.#default.ICON
        this.#template = options.template ?? this.#default.TEMPLATE
        this.#texts = {
            ...this.#default.TEXTS,
            ...options.texts,
        }

        this.#toastContainer = this.#createToastContainer()
        this.#createToastNode(this.#template)

        // Append container to body
        document.body.appendChild(this.#toastContainer)
    }

    /**
     * Create the Toast container and add it to the DOM
     *
     *
     * @return {ChildNode}
     */
    #createToastContainer() {
        // Check if there is already a container with the same #positioning
        const base64Position = btoa(this.#position)
        const existingToastContainer = document.querySelector(
            `[data-bs-toaster="${base64Position}"]`
        )

        let containerNode = null

        if (
            existingToastContainer === null ||
            existingToastContainer instanceof HTMLDivElement === false
        ) {
            containerNode = new DOMParser().parseFromString(
                this.#container,
                "text/html"
            ).body.childNodes[0]

            containerNode.classList.add(...this.#position.split(" "))

            containerNode.dataset.bsToaster = base64Position
        } else {
            containerNode = existingToastContainer
        }

        return containerNode
    }

    /**
     * Create  the Toast element
     * @param template
     * @return {ChildNode}
     */
    #createToastNode(template = this.#template) {
        return new DOMParser().parseFromString(template, "text/html").body
            .childNodes[0]
    }

    /**
     * Add timer text
     *
     * @param timerOption
     * @param delay
     * @param timerNode
     * @param toastNode
     */
    #renderTime(timerOption, delay, timerNode, toastNode) {
        switch (timerOption) {
            case Toaster.timer.ELAPSED: {
                timerNode.innerText = this.#texts.justNow
                // Start a timer that updates the text of the time indicator every minute
                let minutes = 1
                let timerInterval = setInterval(() => {
                    timerNode.innerText = `${minutes}${this.#texts.minute}`
                    minutes++
                }, 60 * 1000)

                // Clear interval on toast disposal
                toastNode.addEventListener("hidden.bs.toast", () => {
                    clearInterval(timerInterval)
                })
                break
            }
            case Toaster.timer.COUNTDOWN: {
                if (delay > 0) {
                    let seconds = delay / 1000
                    timerNode.innerText = `${seconds}${this.#texts.second}`
                    let countdownTimer = setInterval(() => {
                        timerNode.innerText = `${--seconds}${this.#texts.second}`
                    }, 1000)

                    // Clear interval on toast disposal
                    toastNode.addEventListener("hidden.bs.toast", () => {
                        clearInterval(countdownTimer)
                    })
                    break
                }
            }
            default: {
                timerNode.remove()
                break
            }
        }
    }

    /**
     * Create the toast content and render it.
     *
     * @param title
     * @param text
     * @param options
     *
     * @return toast
     *
     */
    create(
        title,
        text,
        options = {
            icon: this.#icon,
            type: this.#type,
            timer: this.#timer,
            delay: this.#delay,
            animation: this.#animation,
            template: null,
            buttons: false,
        }
    ) {
        // Set Options Defaults
        const type = options.type ?? this.#type
        const timer = options.timer ?? this.#timer
        const delay = options.delay ?? this.#delay
        const animation = options.animation ?? this.#animation
        let icon = options.icon ?? this.#icon
        let template = options.template ?? this.#template
        let buttons = options.buttons ?? false

        // Use tags for rendering
        template = template.replace(/%TEXT\%/g, text)
            .replace(/%TITLE%/g, title)
            .replace(/%ICON%/g, icon)
            .replace(/%BUTTONS%/g, buttons)     // hidden later if necessary
            .replace(/%TYPE%/g, type)

        // Create the template
        const toastNode = this.#createToastNode(template)

        // Set attributes
        toastNode.dataset.bsAutohide = (Number.isInteger(delay) && delay > 0).toString()
        toastNode.dataset.bsDelay = delay.toString()
        toastNode.dataset.bsAnimation = animation.toString()

        // Manage icon
        if (!icon) {
            toastNode.querySelector(".bs-toaster-icon").remove()
        }

        // Manage buttons the same way
        if (!buttons) {
            toastNode.querySelector(".bs-toaster-buttons").remove()
        }

        // Add timer
        this.#renderTime(timer, delay, toastNode.querySelector(".bs-toaster-timer"), toastNode)

        // Type can be used anywhere, so we change it in last

        //Render the toast
        this.#render(toastNode)

        return toastNode
    }


    /**
     * Add toast element to the container and build the BS component
     * @param toastNode
     */
    #render(toastNode) {
        this.#toastContainer.appendChild(toastNode)

        // Add remove event
        toastNode.addEventListener("hidden.bs.toast", () => {
            toastNode.remove()
        })

        // Init Boostrap Toast
        const toast = new Toast(toastNode)
        toast.show()
    }
}

export default Toaster