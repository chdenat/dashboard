/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Session.js                                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 06/11/2023  15:56                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {MINUTE} from '/dashboard/assets/js/dsb.js'
import {User} from '/dashboard/assets/js/User.js'

export class Session {
    /**
     * context is used to have a lot of information from PHP
     *
     * @since 1.0
     */
    context = {}

    // Main session timer
    endTimer = 0
    END_TIMER = 15 * MINUTE

    //Final countdown
    finalTimer = 0
    FINAL_TIMER = 2 * MINUTE

    // Timer before the final countdown
    endSoonTimer = 0
    SOON_TIMER = 0 //later


    /**
     * User session initialisation
     *
     * @since 1.0
     */
    constructor() {
        this.init()
    }

    init = () => {
        this.setContext().then(() => {
            if (this.context.logged) {
                this.endTimer = this.context.lifetime * 1000
                this.SOON_TIMER = this.endTimer - this.FINAL_TIMER
                this.prepareModals()
                this.continues()
                this.trapActivity()
            }
        })
    }

    /**
     * We launch 2 timers,
     * one for the end of session and one that ends before, to warn the user the session will expire soon
     *
     * @since 1.0
     *
     */
    checkExpiration = () => {

        /**
         * Bail early if we are in a permanent session
         */
        if (this.getPermanent()) {
            return
        }

        this.SOON_TIMER = this.END_TIMER - this.FINAL_TIMER

        /**
         * Countdowns start...
         */

        // The master one, used for session end
        this.endTimer = setTimeout(() => {
                let session_event = new Event('session-exit')
                session_event.session = this.name
                document.dispatchEvent(session_event)
            },
            this.END_TIMER,
        )
        // Another one, used to warn that the session will end soon
        this.endSoonTimer = setTimeout(() => {
                let session_event = new Event('session-soon-exit')
                session_event.session = this.name
                document.dispatchEvent(session_event)
            },
            this.SOON_TIMER,
        )
    }

    /**
     * The session is closed, we launch the required modal to invite user
     * to login or to stay unlogged
     *
     * @since 1.0
     *
     */
    close = () => {
        this.pauseActivity()

        clearTimeout(this.endSoonTimer)
        clearInterval(this.finalTimer)
        dsb.modal.load('end-session')
        dsb.modal.show()

        //  (new Modal ({action='end-session'})).show()


    }

    /**
     * The session will close soon,we launch the required modal to invite user
     * to stay logged in or to log out
     *
     * @since 1.0
     *
     */
    closeSoon = async () => {
        this.pauseActivity()

        await dsb.modal.load('end-session-soon')

        clearInterval(this.finalTimer)
        this.finalTimer = setInterval(this.countdownBeforeSessionEnds, this.FINAL_TIMER)
        dsb.modal.show()
    }

    /**
     * Relaunch the login modal fro a modal
     *
     * @return {Promise<void>}
     *
     * @since 1.0
     *
     */
    relog = async () => {
        await dsb.modal.load('login-form')
    }

    /**
     * The session continues (after an activity event.
     * We reinitiate some data
     *
     * @since 1.0
     *
     */
    continues = () => {
        this.clearAllTimers()
        this.checkExpiration()
    }

    /**
     * Clear all the timers we use for the session management
     *
     * @since 1.0
     *
     */
    clearAllTimers = () => {
        clearTimeout(this.endTimer)
        clearTimeout(this.endSoonTimer)
        clearInterval(this.finalTimer)
    }

    /**
     * Show the countdown of time befoer the end of the session
     *
     * @since 1.0
     *
     */
    countdownBeforeSessionEnds = () => {
        let show_time = document.getElementById('end-session-timer')
        if (show_time !== null) {
            if (show_time.innerHTML === '') {
                show_time.innerHTML = this.endTimer - this.SOON_TIMER * 1000
            } else {
                show_time.innerHTML = show_time.innerHTML - 1
            }
        }
    }

    /**
     * Trapping activity events
     *
     * @since 1.0
     *
     */
    trapActivity = () => {
        User.activityEvents.forEach(event => {
            document.addEventListener(event, this.continues)
        })
    }

    /**
     * Pause trapping of activity events
     *
     * @since 1.0
     *
     */
    pauseActivity = () => {
        User.activityEvents.forEach(event => {
            document.removeEventListener(event, this.continues)
        })
    }
    /**
     * Prepare modals, ie activate the required events
     * of stop the events to avoid modal
     *
     * @param prepare true add events else stop them
     *
     * @since 1.0
     *
     */
    prepareModals = (prepare = true) => {
        if (prepare) {
            document.addEventListener('session-exit', this.close)
            document.addEventListener('session-soon-exit', this.closeSoon)
        } else {
            document.removeEventListener('session-exit', this.close)
            document.removeEventListener('session-soon-exit', this.closeSoon)
        }
    }

    /**
     * Shortcut to prepareModals(false)
     *
     * @since 1.0
     *
     */
    removeModals = () => {
        this.prepareModals(false)
    }

    /**
     * Get the user session context defined in PHP by doing an Ajax request.
     *
     * @return {Promise<void>}
     *
     * @since 1.0
     *
     */
    setContext = async () => {

        /**
         * User context is based on session information
         */
        await fetch(dsb_ajax.get + '?' + new URLSearchParams({
            action: 'get-session',
        })).then(response => {
            if (!response.ok) {
                throw Error(response.statusText)
            }
            return response
        })
            .then(response => response.json())
            .then(session => {
                this.context = session
            })

    }

    /**
     * Clear the user session context content  locally (session marked as logged out)
     *
     * @since 1.0
     *
     */
    clearContext = () => {
        this.context = {
            logged: false,
            user: '',
            roles: [],
            lifetime: '',
            connection: 0,
            activity: 0,
            permanent: false,
        }

    }

    /**
     * Set permanent (ie no session lifetime tracking) or not (default)
     *
     * @param permanent  default to false
     *
     * @since 1.0
     */
    setPermanent = (permanent = false) => {
        this.context.permanent = permanent
    }

    /**
     * Get permanent user context value
     *
     * @since 1.0
     *
     */
    getPermanent = () => {
        return this.context.permanent
    }

    /**
     * Return true if session is active, else false.
     *
     * @return {boolean}
     */
    active = () => {
        return this.context.logged ?? false
    }

}