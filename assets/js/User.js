/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : User.js                                                                                                     *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 14/04/2023  16:49                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Block}             from 'Block'
import {DashboardUI as UI} from 'DashboardUI'
import {dsb, SECOND}       from 'dsb'

export class User {
    static activityEvents = ['click', 'keydown', 'mousedown', 'mousemove', 'scroll', 'touchstart']
    LOGIN_EVENT = 'dsb-login'
    LOGOUT_EVENT = 'dsb-logout'
    LOGOUT_ANIMATION_DELAY = 2 * SECOND
    #event = dsb.content_event
    
    constructor() {
        this.#event.on(this.LOGIN_EVENT, this.postLoginAction)
        this.#event.on(this.LOGOUT_EVENT, this.postLogoutAction)
        
        // add some UI enhancements to passwords in modals
        Block.event.emit('modal/loaded/login-form', dsb.ui.manage_password)
        Block.event.emit('modal/loaded/change-password', dsb.ui.manage_password)
        
    }
    
    get event() {
        return this.#event
    }
    
    /**
     * Login process
     *
     * @returns {boolean}
     *
     * @since 1.6
     *
     */
    login = () => {
        
        const form = document.getElementById('login')
        const form_data = {
            headers: {'Content-Type': 'multipart/form-data'},
            user: form.user.value,
            password: form.password.value,
            action: 'login',
        }
        dsb.session.context.user = form.user.value
        
        fetch(dsb_ajax.post, {
            method: 'POST',
            body: JSON.stringify(form_data),
        }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText)
                }
                return response
            })
            .then(response => response.json())
            .then(data => {
                if (data.authorization) {
                    dsb.modal.hide()
                    dsb.toast.message({
                        title: dsb.ui.get_text_i18n('user/log-in', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('user/log-in', 'text'), `<strong>${form.user.value}</strong>`),
                        type: 'success',
                    })
                    this.#event.emit(this.LOGIN_EVENT)
                    return true
                }
            })
            .catch(error => {
                    dsb.error.init('form .alert').message(error)
                    return false
                },
            )
    }
    
    /**
     * System callback after login
     *
     * @return {Promise<void>}
     *
     * @since 1.6
     */
    postLoginAction = async () => {
        document.body.classList.add('logged-in')
        document.body.classList.add(dsb.session.context.user)
        
        dsb.session.init()
        
        // As some parts depends on user session, we reload all the page content
        await Block.importChildren()
    }
    
    /**
     * Logout process
     *
     * @param event Event  (null)
     * @param button clicked button (null)
     * @param redirection (null)
     *
     * @return {Promise<void>}
     *
     * @since 1.6
     *
     */
    logout = async (event = null, button = null, redirection = null) => {
        
        // if redirection is null, we try to get it from button, ie in data-logout-redirection
        if (null === redirection) {
            if (button) {
                redirection = button.dataset.logoutRedirection ?? null
            }
        }
        const form = document.getElementById('logout-confirm')
        const from_session_modal = (null === form) // if false, we don not use a modal
        let form_data = {}
        
        if (from_session_modal) {
            // call from the exit session soon modal
            form_data = {
                user: dsb.session.context.user,
                action: 'logout',
            }
        } else {
            // call from the 'normal' logout modal
            form_data = {
                headers: {'Content-Type': 'multipart/form-data'},
                user: form.user.value,
                action: 'logout',
            }
        }
        
        await fetch(dsb_ajax.post, {
            method: 'POST',
            body: JSON.stringify(form_data),
        }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText)
                }
                return response
            })
            .then(response => response.json())
            .then(data => {
                if (data.logout) {
                    if (!from_session_modal) {
                        dsb.modal.hide()
                    }
                    
                    UI.showOverlay()
                    
                    const toast = dsb.toast.message({
                        title: dsb.ui.get_text_i18n('user/log-out', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('user/log-out', 'text'), `<strong>${dsb.session.context.user}</strong>`),
                        type: 'success',
                        delay: this.LOGOUT_ANIMATION_DELAY,
                    })
                    this.#event.emit(this.LOGOUT_EVENT)
                    
                    // Once toast has been hidden, we reload the page
                    toast.addEventListener('hidden.bs.toast', async () => {
                        UI.hideOverlay()
                        if (redirection) {
                            let t = new Block('#content#', null, redirection)
                            await t.load(true)
                        }
                        Block.reload_page(redirection)
                    }, {once: true})
                    
                }
            })
            .catch(error => {
                    dsb.error.init('form .alert').message(error)
                },
            )
    }
    
    /**
     * System callback after logout
     *
     * @since 1.6
     *
     */
    postLogoutAction = () => {
        document.body.classList.remove('logged-in')
        if ('' !== dsb.session.context.user) {                // user not specified... ie from PHP, not ajax
            document.body.classList.remove(dsb.session.context.user)
        }
        
        dsb.session.clearAllTimers()
        dsb.session.removeModals()
        dsb.session.clearContext()
    }
    
    /**
     * Change password process
     */
    changePassword = () => {
        const form = document.getElementById('change-password')
        const form_data = {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            new: document.getElementById('new-password').value,
            confirm: document.getElementById('confirm-password').value,
            old: document.getElementById('old-password').value,
            user: form.user?.value,
            action: 'confirm',
        }
        dsb.session.context.user = form.user.value
        
        fetch(dsb_ajax.post, {
            method: 'POST',
            body: JSON.stringify(form_data),
        }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText)
                }
                return response
            })
            .then(response => response.json())
            .then(data => {
                if (data.changed) {
                    dsb.modal.hide()
                    this.#event.emit(this.LOGOUT_EVENT)
                    dsb.toast.message({
                        title: dsb.ui.get_text_i18n('user/new-password', 'title'),
                        message: sprintf(dsb.ui.get_text_i18n('user/new-password', 'text'), dsb.session.context.user),
                        type: 'success',
                    })
                    Block.reload_page()
                    
                }
            })
            .catch(error => {
                    dsb.error.init('form .alert').message(error)
                },
            )
    }
    
}