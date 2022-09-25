/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : utils.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  1/18/22, 11:19 AM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/
import {customAlphabet} from '../vendor/nanoid.js'
import {EventEmitter} from "../vendor/EventEmitter/EventEmitter.js";

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvw', 10)
const {Template} = await import ('./Template.js')


const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export {SECOND, MINUTE, HOUR, DAY}


var dsb = {

    content_event: new EventEmitter(),

    // app information
    page: {
        main_title: 'Dashboard',

        /**
         * Set page title
         *
         * @param title if set, page title is "MAIN : title" else (default) it is "MAIN"
         *
         * @since 1.0
         */
        set_title: (title = null) => {
            if (title === null) {
                document.title = dsb.page.main_title
                return
            }

            document.title = `${dsb.page.main_title}: ${title}`
        },

        /**
         * History management from link on menu
         *
         * Add the url in the browser history
         *
         * @param item
         *
         * @since 1.0
         *
         */
        add_to_history_from_menu: (item) => {
            let href = item.getAttribute('href')
            href = href.startsWith('/') ? href : '/' + href
            history.pushState({
                title: document.title,
                full: href
            }, dsb.menu.item_text(item), href)
        },

        /**
         * Add  History management from a tab
         *
         * Add the url in the browser history
         *
         *
         * @since 1.0
         *
         * @param page_title
         * @param full
         * @param url
         */
        add_to_history: (page_title, full, url) => {
            let href = url.startsWith('/') ? url : '/' + url
            history.pushState({
                title: page_title,
                full: full
            }, page_title, href)
        },

        /**
         * History management
         *
         * @param event
         */
        show_history_item: (event) => {
            let url = location.href
            if (!event) {
                url = '/home'
            }
            if (event.state === null) {
                url = '/home'
            } else {
                url = event.state.full ?? '/home'
            }

            location.href = url;
        },

        /**
         * Try to retrieve the right page in the history and isplay it.
         *
         * @since 1.0
         */
        init: () => {
            try {
                window.onpopstate = (event) => setTimeout(dsb.page.show_history_item, 0, event);
            } catch (e) {
                console.error(e)
            }
        }
    },

    menu: {

        template_id: "#menu#",
        pathname: null,
        current_roles: [],
        json: null,

        change_id: (new_id) => {
            dsb.menu.template_id = new_id
        },

        /**
         * Check the URL to find if it exists in the menu.
         * If it exists (or something similar)
         * and open the menu accordingly.
         *
         * If nothing found, we open the default
         *
         *
         * @param template
         * @param pathname
         */
        synchronize: (template, pathname = '') => {
            dsb.menu.change_id(template.ID)

            dsb.menu.read_json().then(data => {
                // If there is no pathname, we use the window location
                if (pathname === '' || pathname === null) {
                    pathname = `${window.location.pathname}${window.location.hash}`
                }
                let origin = pathname
                pathname = dsb.menu._clean_path(pathname)

                let found = false               // found in the menu
                let found_with_role = false     // found with a specific role if not in menu
                let item = {}

                // We try as is,then without hash and finally without index.
                for (let key of [' ', '#', 'index']) {
                    pathname = pathname.split(key)[0]
                    // Some entry in the menu ?
                    item = document.querySelector(`[data-template-id="${template.ID}"] a[data-level*="menu-item-"][href*="${pathname}"]`);
                    if (null !== item) {
                        // Yes, so we clean and check it
                        if (pathname === dsb.menu._clean_path(item.getAttribute('href').split(key)[0])) {
                            found = true;
                            break
                        }

                    } else if (!dsb.user.session.active()) {
                        // Nothing... May be the user need to be logged in to see this item in the menu ...
                        found_with_role = dsb.menu.find_items_with_roles(dsb.menu.json.menu, 'href', pathname, dsb.menu.all_roles(), true).length > 0

                    }
                    if (found || found_with_role) {
                        break;
                    }
                }

                if (!found) {
                    if (!found_with_role) {
                        // Nothing with role
                        //  we try to open the default if it is / | /home => pathname = null | home
                        if (pathname === '' || pathname === 'home') {
                            item = document.querySelector(`[data-template-id="${template.ID}"] a[data-level*="menu-item"][data-default-page]`);
                            if (null !== item) {
                                found = true;
                            }
                        }
                    } else {
                        // We find an entry with the role : we load the modal and pass some parameters
                        dsb.menu.pathname = pathname
                        dsb.modal.load('login-form', {template: template, pathname: pathname});
                        dsb.modal.show()
                        return
                    }
                }
                // If we found something, we'll open the right menu
                // else we redirect to 404.
                if (found || found_with_role && item) {
                    let levels = item.dataset.level.split('-')
                    let id = 'menu-item-'
                    levels.slice(2).forEach(level => {  // remove the 2 first, 'menu' and 'item'
                        id += level
                        // try to click on item defined as href=#<level-x-x>
                        let item = document.querySelector(`[href="#${id}"]`)
                        // or id= <level-x-x>
                        if (null === item) {
                            item = document.querySelector(`[data-level=${id}]`)
                        }

                        // Click on
                        let link = item.getAttribute('href')
                        if (link.startsWith('#menu')) {
                            // Menu section : we click to open it.
                            item.click()
                        } else {
                            // Menu item : we do not click but simulate
                            dsb.menu.click(item, true);
                            dsb.ui.show_tab(Template._check_link(link).tab)
                        }
                        id += '-'

                    })
                } else {
                    Template.page_404('#content#', origin)
                }
            })
        },

        /**
         * Get all roles
         */
        all_roles: () => {
            return ['logged', 'admin']
        },

        /**
         * Find a key and/or value in a nested object
         *
         * => from https://www.tutorialspoint.com/deep-search-json-object-javascript
         *
         * @return {{}|*}
         * @param obj
         * @param key
         * @param value
         * @param roles
         * @param single
         */
        find_items_with_roles: (obj = {}, key, value, roles = []) => {
            const result = []
            let used_roles = {}
            const recursive = (obj = {}) => {
                if (!obj || typeof obj !== 'object') {
                    return;
                }
                // If no roles in input or no roles in data, search is enabled
                let search = roles.length === 0 || obj.roles === undefined

                if (obj?.roles !== undefined && roles.length > 0) {
                    // If there are some roles, we try to see if roles in data are
                    //  included in input roles
                    used_roles = obj.roles.filter(x => roles.includes(x))
                    search = used_roles.length > 0
                }

                // search is enabled
                if (search) {
                    // key and value match... OK we get'em

                    if (dsb.menu._clean_path(obj[key]) === dsb.menu._clean_path(value)) {
                        result.push({data: obj, roles: used_roles});
                    }
                    // Lets'trayt
                    Object.keys(obj).forEach(function (k) {
                        recursive(obj[k]);
                    })
                }
            }
            // All starts here
            recursive(obj);
            return result;
        },


        /**
         * Click on a menu item (in cascade, ie it opens all the hierarchy menu)
         * - mark it opened
         * - display the url in the history
         *
         * @param item
         * @param historize  indicates if we need historization (default false)
         *
         * @since 1.0
         *
         */
        click: (item, historize = false) => {
            // it's the link ?  Manage history (and add url in the browser bar)
            if (item?.dataset?.level) {
                // Mark new menu item opened
                document.querySelector(`.opened[href]`)?.classList.remove('opened')
                item.classList.add('opened')
                // change title
                dsb.page.set_title(dsb.menu.item_text(item)) //TODO change
                if (historize) {
                    dsb.page.add_to_history_from_menu(item)
                }
            }
            return false
        },

        /**
         * Get the text from the menu item
         *
         * @param item
         * @return {*}
         *
         * @since 1.0
         *
         */
        item_text: (item) => {
            return item?.innerText
        },

        /**
         * Suppress / at both first and end
         *
         * @param path
         * @return path
         *
         * @private
         */
        _clean_path: (path) => {
            if (path) {
                if (path.startsWith('/')) {
                    path = path.substring(1)
                }
                if (path.endsWith('/')) {
                    path = path.substring(0, path.length - 1)
                }
            }
            return path
        },

        update: () => {
            let id = dsb.user.session.context?.referrer;
            if (id) {
                let item = id.split(/(level-[0-9]+)/gm);
            }
        },

        read_json: async () => {
            if (dsb.menu.json === null) {
                await fetch((dsb_ajax.get) + '?' + new URLSearchParams({
                    action: 'read-json-menu',
                })).then(function (response) {
                    return response.json()
                }).then(function (data) {
                    dsb.menu.json = data
                }).catch((error) => {
                    console.error('Error:', error); // Print or not print ?
                })
            }
            return dsb.menu.json
        },

        /**
         * Menu Initialisation
         *
         * @since 1.0
         *
         */
        init: async (event) => {
            /**
             *
             * Read JSON menu
             *
             * @since 1.0
             *
             */

            dsb.menu.read_json()

            let menu_container = document.getElementById('menu-container');

            // We trap a specifi event on menu items click to instantiate the collapse/uncollapse
            dsb.content_event.on('click', (item) => {
                dsb.menu.click(item, true)
            })

            /**
             * Close/open all 1st level menu
             */
            let all_open = false;
            menu_container.querySelector('#menu-container .dsb-vertical')?.addEventListener('click', (event) => {
                all_open = !all_open
                event.preventDefault()
                menu_container?.querySelectorAll(`#menu-container  #menu-wrapper a[data-bs-toggle="collapse"][aria-expanded="${!all_open}"]`).forEach((element) => {
                    let item = bootstrap.Collapse.getOrCreateInstance(menu_container.querySelector(element.getAttribute("href")))
                    if (all_open) {
                        item?.show()
                    } else {
                        item?.hide()
                    }
                })
            })

            /**
             * Adds a specific class when horizontal collapse down
             */
            menu_container?.querySelector('.dsb-horizontal')?.addEventListener('click', (event) => {
                menu_container.classList.toggle('collapsed')
            });
            dsb.menu.update();


            /**
             * Call synchronize when menu has been loaded
             */
            dsb.menu.synchronize(event?.template, dsb.menu.pathname)

        },
    },

    /**
     * template management
     */
    template: {

        init: () => {
            // During the init phase, we do not use teh 404 redirection
            Template.use_404(false)

            // When a template has been loaded, we register specific link actions and load all the children
            Template.event.once('load-done', template => {
                // Let open links in content if required
                template.container.querySelectorAll('a[data-content]').forEach(item => {

                    item.addEventListener('click', event => {
                        Template.load_from_event(event)
                        event.preventDefault()
                        dsb.content_event.emit('click', item)
                    })

                });
                // Here is the case we need to open in content pseudo-modal
                template.container.querySelectorAll('a[data-content-modal]').forEach(item => {
                    item.addEventListener('click', dsb.ui.show_intermediate_content)
                });

                // Download the family
                Template.load_all_templates(template.container)


                // Init UI
                dsb.ui.init(template.container)

                Template.use_404()

            })

            // Update the page

            Template.load_all_templates()
        }

    }
    ,

    /**
     * Toast management
     */
    toast: {
        _element: null,
        _instance: null,
        /**
         *
         * @param title        of the toast
         * @param message      content of the toast
         * @param button
         * @param type         any bootstrap type. Depending on the type, different icons are shown.
         * @param delay        Default to 3 seconds, To set it to permanent use 0
         * @param hide          autohide = true, permanent = false
         *
         * @return void
         * @since 1.0
         *
         */
        message: function ({title = '', message = '', button = null, type = 'primary', delay = 3000, hide = true}) {

            let text, icon;
            switch (type) {
                case 'success':
                    icon = 'fas fa-check-circle'
                    break;
                case 'danger':
                    icon = 'fa fa-bomb'
                    break;
                case 'warning':
                    icon = 'fas fa-exclamation-triangle'
                    break;
                default:
                    icon = 'fas fa-fa-bell'
            }
// Let's use the right toast

            let toast = dsb.toast.autohide
            if (false === hide) {
                toast = dsb.toast.permanent
            }
            let element = toast._element

            element.querySelector('.toast-header span').innerHTML = '<i class="' + icon + '"></i>' + title
            element.querySelector('.toast-body .toast-message').innerHTML = message
            let btn = element.querySelector('.toast-body .btn')

            if (button !== null) {
                btn.innerHTML = button.text
                btn.href = button.href
                btn.id = button.id
                btn.classList.add('btn-' + type)
                dsb.ui.show(btn)
            } else {
                dsb.ui.hide(btn)
            }
            element.classList.add('bg-' + type)

            toast._instance.show()
        }

        ,

        set_life: (delay) => {
            if (0 === delay) {
                dsb.toast.autohide._element.setAttribute('data-bs-autohide', false)
            } else {
                dsb.toast.autohide._element.setAttribute('data-bs-delay', delay)
            }
        },

        /**
         * Initialisation of the toast object
         *
         * @returns {dsb.toast}
         *
         * @since 1.0
         */
        init: function (delay = 3000) {

            let tmp = document.querySelector('#dsb-permanent-toast .toast')
            dsb.toast.permanent = {
                _element: tmp,
                _instance: new bootstrap.Toast(tmp, {autohide: false})
            }
            dsb.toast.autohide = {
                _element: tmp,
                _instance: new bootstrap.Toast(tmp, {delay: delay})
            }

            // clean classes when toast are hidden
            dsb.toast.permanent._element.addEventListener('hidden.bs.toast', () => {
                ["bg-success", "bg-warning", "bg-danger"].forEach(cl => {
                    if (dsb.toast.permanent._element.classList.contains(cl)) {
                        dsb.toast.permanent._element.classList.remove(cl);
                    }
                })
            })
            dsb.toast.autohide._element.addEventListener('hidden.bs.toast', () => {
                ["bg-success", "bg-warning", "bg-danger"].forEach(cl => {
                    if (dsb.toast.autohide._element.classList.contains(cl)) {
                        dsb.toast.autohide._element.classList.remove(cl);
                    }
                })
            })
            return dsb.toast;
        }
    }
    ,

    modal: {
        _element: null,
        _instance: null,
        _parameters: null,
        /**
         * Init user modal
         *
         * @returns {dsb.modal}
         *
         * @since 1.0
         *
         */
        init: function () {
            this._element = document.querySelector('#dashboard-modal')
            this._dialog = this._element.querySelector('.modal-dialog')
            this._instance = new bootstrap.Modal(this._element, {focus: false})

            return this
        }

        ,

        /**
         * Show the user modal
         *
         * @returns {dsb.modal}
         *
         * @since 1.0
         *
         */
        show: function () {
            this._instance.show();
            return this;
        }
        ,

        /**
         * Hide the user modal
         *
         * @returns {dsb.modal}
         *
         * @dince 1.0
         *
         */
        hide: function () {
            this._instance.hide();
            return this;
        }
        ,

        /**
         * Change the modal content
         *
         * @param html
         * @returns {dsb.modal}
         *
         * @since 1.0
         *
         */
        message: function (html) {
            this._element.querySelector('.modal-content').innerHTML = html;
            return this
        }
        ,

        /**
         * This function makes an Ajax call used to get the modal content
         *
         * @param action The ajax action name
         * @param params some params to send to Ajax
         * @param custom use DSB ajax or custom ajax
         *
         * @since 1.0
         *
         */
        load: function (action, params = {}, custom = false) {
            this._parameters = params
            this._parameters['action'] = action
            dsb.modal.resize()

            this._element.addEventListener('show.bs.modal', dsb.modal.loading_events)
            this._element.addEventListener('shown.bs.modal', dsb.modal.load_events)

            fetch(((custom) ? ajax.get : dsb_ajax.get) + '?' + new URLSearchParams({
                action: action,
                params: JSON.stringify(params),
            })).then(function (response) {
                return response.text()
            }).then(function (html) {
                dsb.modal.message(html)
                Template.load_all_templates(document.getElementById('dashboard-modal'))
                return true;
            }).catch((error) => {
                console.error('Error:', error); // Print or not print ?
            })
        }
        ,

        /**
         * Load 2 specific events when the modal is laoding
         *
         */
        loading_events: () => {
            // Throw a  generic load event
            let generic = new Event('modal/loading')
            generic.modal = dsb.modal
            generic.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(generic)

            // and a new specific running event
            let specific = new Event(`modal/loading/${dsb.modal._parameters.action}`)
            generic.modal = dsb.modal
            generic.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(generic)
        },

        /**
         * Load 2 specific events when the modal has been shown
         *
         *
         */
        load_events: () => {
            // Throw a  generic load event
            let generic = new Event('modal/loaded')
            generic.modal = dsb.modal
            generic.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(generic)
            // and a new specific running event

            let specific = new Event(`modal/loaded/${dsb.modal._parameters.action}`)
            generic.modal = dsb.modal
            generic.parameters = dsb.modal._parameters.keys
            document.dispatchEvent(specific)
        },

        /**
         * Add the possibility to resize a modal
         *
         * @param size = sm | node | lg | xl
         */
        resize: (size = '') => {
            let sizes = ['modal-xl', 'modal-lg', 'modal-sm']
            let _dialog = document.querySelector('#dashboard-modal .modal-dialog')
            _dialog.classList.remove(...sizes)
            if (size !== '') {
                _dialog.classList.add(`modal-${size}`);
            }
        }

    }
    ,

    /**
     * User management
     */
    user: {

        referrer: {}
        ,
        activity_events: ['click', 'keydown', 'mousedown', 'mousemove', 'scroll', 'touchstart'],

        /**
         * Events are used to maintain DSB on specific events
         */
        events: {
            /**
             * Login event, when the login is successful or at load when a session is active
             *
             * @since 1.0
             *
             */
            dsb_login: new Event("dsb-login", {}),
            login: (event) => {
                document.body.classList.add("logged-in");
                document.body.classList.add(dsb.user.session.context.user);

                dsb.user.session.init()

                // As some parts depends on user session, we relead all the page content
                Template.load_all_templates()

                dsb.user.events.loaded();
                event.preventDefault();
            },

            /**
             * Logout event, when the logout is successful or at load when there is no session
             *
             * @since 1.0
             *
             */
            dsb_logout: new Event("dsb-logout"),
            logout: (event) => {
                document.body.classList.remove("logged-in");
                if ('' !== dsb.user.session.context.user) {                // user not specified... ie from PHP, not ajax
                    document.body.classList.remove(dsb.user.session.context.user);
                }

                dsb.user.session.clear_timers()
                dsb.user.session.remove_modals()
                dsb.user.session.clear_context();

                event.preventDefault();
            },
            loaded: () => {
            }

        }
        ,
        /**
         * User session management
         *
         * @since 1.0
         *
         */
        session: {
            /**
             * context is used to have a lot of information from PHP
             *
             * @since 1.0
             */
            context: {},

            // Main session timer
            end_timer: 0,
            END_TIMER: 15 * MINUTE,

            //Final countdown
            final_timer: 0,
            FINAL_TIMER: 2 * MINUTE,

            // Timer before the final countdown
            soon_timer: 0,
            SOON_TIMER: 0, //later

            /**
             * We launch 2 timers,
             * one for the end of session and one that ends before, to warn the user the session will expire soon
             *
             * @since 1.0
             *
             */
            check_expiration: () => {

                /**
                 * Bail early if we are in a permanent session
                 */
                if (dsb.user.session.get_permanent()) {
                    return
                }

                dsb.user.session.SOON_TIMER = dsb.user.session.END_TIMER - dsb.user.session.FINAL_TIMER


                /**
                 * Countdowns start...
                 */

                // The master one, used for session end
                dsb.user.session.end_timer = setTimeout(() => {
                        let session_event = new Event('session-exit')
                        session_event.session = dsb.user.session.name;
                        document.dispatchEvent(session_event)
                    },
                    dsb.user.session.END_TIMER
                )
                // Another one, used to warn that the session will end soon
                dsb.user.session.soon_timer = setTimeout(() => {
                        let session_event = new Event('session-soon-exit')
                        session_event.session = dsb.user.session.name;
                        document.dispatchEvent(session_event)
                    },
                    dsb.user.session.SOON_TIMER
                )
            },

            /**
             * The session is closed, we launch the required modal to invite user
             * to login or to stay unlogged
             *
             * @since 1.0
             *
             */
            close: () => {
                dsb.user.session.pause_activity()

                clearTimeout(dsb.user.session.soon_timer)
                clearInterval(dsb.user.session.final_timer)
                dsb.modal.load('end-session')
                dsb.modal.show()

                //  (new Modal ({action:'end-session'})).show()


            },

            /**
             * The session will close soon,we launch the required modal to invite user
             * to stay logged in or to log out
             *
             * @since 1.0
             *
             */
            close_soon: () => {
                dsb.user.session.pause_activity()

                dsb.modal.load('end-session-soon')

                clearInterval(dsb.user.session.final_timer)
                dsb.user.session.final_timer = setInterval(dsb.user.session.countdown_before_session_end, dsb.user.session.FINAL_TIMER)
                dsb.modal.show()
            },

            /**
             * Relaunch the login modal fro a modal
             *
             * @return {Promise<void>}
             *
             * @since 1.0
             *
             */
            relog: async () => {
                await dsb.modal.load('login-form');
            },

            /**
             * The session continues (after an activity event.
             * We reinitiate some data
             *
             * @since 1.0
             *
             */
            continues: () => {
                dsb.user.session.clear_timers()
                dsb.user.session.check_expiration()
            },

            /**
             * Clear all the timers we use for the session management
             *
             * @since 1.0
             *
             */
            clear_timers: () => {
                clearTimeout(dsb.user.session.end_timer)
                clearTimeout(dsb.user.session.soon_timer)
                clearInterval(dsb.user.session.final_timer)
            },

            /**
             * Show the countdown of time befoer the end of the session
             *
             * @since 1.0
             *
             */
            countdown_before_session_end: () => {
                let show_time = document.getElementById('end-session-timer')
                if (show_time !== null) {
                    if (show_time.innerHTML === '') {
                        show_time.innerHTML = dsb.user.session.end_timer - dsb.user.session.SOON_TIMER * 1000
                    } else {
                        show_time.innerHTML = show_time.innerHTML - 1
                    }
                }
            },

            /**
             * Trapping activity events
             *
             * @since 1.0
             *
             */
            trap_activity: () => {
                dsb.user.activity_events.forEach(event => {
                    document.addEventListener(event, dsb.user.session.continues)
                })
            },

            /**
             * Pause trapping of activity events
             *
             * @since 1.0
             *
             */
            pause_activity: () => {
                dsb.user.activity_events.forEach(event => {
                    document.removeEventListener(event, dsb.user.session.continues)
                })
            },
            /**
             * Prepare modals, ie activate the required events
             * of stop the events to avoid modal
             *
             * @param prepare true add events else stop them
             *
             * @since 1.0
             *
             */
            prepare_modals: (prepare = true) => {
                if (prepare) {
                    document.addEventListener('session-exit', dsb.user.session.close)
                    document.addEventListener('session-soon-exit', dsb.user.session.close_soon)
                } else {
                    document.removeEventListener('session-exit', dsb.user.session.close)
                    document.removeEventListener('session-soon-exit', dsb.user.session.close_soon)
                }
            },

            /**
             * Shortcut to prepare_modals(false)
             *
             * @since 1.0
             *
             */
            remove_modals: () => {
                dsb.user.session.prepare_modals(false)
            },

            /**
             * Get the user session context defined in PHP by doing an Ajax request.
             *
             * @return {Promise<void>}
             *
             * @since 1.0
             *
             */
            set_context: async () => {

                /**
                 * User context is based on session information
                 */
                await fetch(dsb_ajax.get + '?' + new URLSearchParams({
                    action: 'get-session',
                })).then(response => {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    return response;
                })
                    .then(response => response.json())
                    .then(session => {
                        dsb.user.session.context = session
                    })

            },

            /**
             * Clear the user session context content  locally (session marked as logged out)
             *
             * @since 1.0
             *
             */
            clear_context: () => {
                dsb.user.session.context = {
                    logged: false,
                    user: '',
                    roles: [],
                    lifetime: '',
                    connection: 0,
                    activity: 0,
                    permanent: false
                }

            },

            /**
             * Set permanent (ie no session lifetime tracking) or not (default)
             *
             * @param permanent  default to false
             *
             * @since 1.0
             */
            set_permanent: (permanent = false) => {
                dsb.user.session.context.permanent = permanent
            },

            /**
             * Get permanent user context value
             *
             * @since 1.0
             *
             */
            get_permanent: () => {
                return dsb.user.session.context.permanent
            },

            /**
             * Return true if session is active, else false.
             *
             * @return {boolean}
             */
            active: () => {
                return dsb.user.session.context.logged ?? false
            },


            /**
             * User session initialisation
             *
             * @since 1.0
             */
            init: async () => {

                // If the user is logged in, we starts timer for managing the session elapsed time
                // and prepare to display some modals ('session about to exit' and 'session exited')

                await dsb.user.session.set_context()

                if (dsb.user.session.context.logged) {
                    dsb.user.session.end_timer = dsb.user.session.context.lifetime * 1000
                    dsb.user.session.SOON_TIMER = dsb.user.session.end_timer - dsb.user.session.FINAL_TIMER
                    dsb.user.session.prepare_modals()
                    dsb.user.session.continues()
                    dsb.user.session.trap_activity()
                }
            },
        }
        ,

        /**
         * Login process
         *
         * @returns {boolean}
         *
         * @since 1.0
         *
         */
        login: function () {

            const form = document.getElementById('login');
            const form_data = {
                headers: {'Content-Type': 'multipart/form-data'},
                user: form.user.value,
                password: form.password.value,
                action: 'login'
            };
            dsb.user.session.context.user = form.user.value;
            fetch(dsb_ajax.post, {
                method: 'POST',
                body: JSON.stringify(form_data)
            }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            })
                .then(response => response.json())
                .then(data => {
                    if (data.authorization) {
                        dsb.modal.hide();
                        dsb.toast.message({
                            title: 'Log in',
                            message: 'User <strong>' + form.user.value + '</strong> has been logged in successfully !',
                            type: 'success'
                        })
                        document.dispatchEvent(dsb.user.events.dsb_login);
                        return true
                    }
                })
                .catch(error => {
                        dsb.error.init('form .alert').message(error);
                        return false
                    }
                )
        }
        ,

        /**
         * Logout process
         *
         * @param event Event  (null)
         * @param button clicked button (null)
         * @param redirection (null)
         *
         * @return {Promise<void>}
         *
         * @since 1.0
         *
         */
        logout: async (event = null, button = null, redirection = null) => {

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
                    user: dsb.user.session.context.user,
                    action: 'logout'
                }
            } else {
                // call from the 'normal' logout modal
                form_data = {
                    headers: {'Content-Type': 'multipart/form-data'},
                    user: form.user.value,
                    action: 'logout'
                }
            }

            await fetch(dsb_ajax.post, {
                method: 'POST',
                body: JSON.stringify(form_data)
            }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            })
                .then(response => response.json())
                .then(data => {
                    if (data.logout) {
                        if (!from_session_modal) {
                            dsb.modal.hide();
                        }
                        // dsb.user.session.manage_events(false)

                        dsb.toast.message({
                            title: 'Log out',
                            message: 'User <strong>' + dsb.user.session.context.user + '</strong> has been logged out.',
                            type: 'success'
                        })
                        document.dispatchEvent(dsb.user.events.dsb_logout);
                        Template.load_all_templates()
                        window.location.href = redirection ?? '/'
                    }
                })
                .catch(error => {
                        dsb.error.init('form .alert').message(error);
                    }
                )
        },
        change_password: function () {
            const form = document.getElementById('change-password');
            const form_data = {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                new: document.getElementById('new-password').value,
                confirm: document.getElementById('confirm-password').value,
                old: document.getElementById('old-password').value,
                user: form.user?.value,
                action: 'confirm'
            };
            dsb.user.session.context.user = form.user.value;

            fetch(dsb_ajax.post, {
                method: 'POST',
                body: JSON.stringify(form_data)
            }).then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            })
                .then(response => response.json())
                .then(data => {
                    if (data.changed) {
                        dsb.modal.hide();
                        document.dispatchEvent(dsb.user.events.dsb_logout);
                        dsb.toast.message({
                            title: 'New password',
                            message: 'Password changed for user <strong>' + dsb.user.session.context.user + '</strong>.',
                            type: 'success'
                        })

                    }
                })
                .catch(error => {
                        dsb.error.init('form .alert').message(error);
                    }
                )
        },

        init: function () {
            dsb.user.session.init()
            document.addEventListener('modal/loaded/login-form', dsb.ui.manage_password)
            document.addEventListener('modal/loaded/change-password', dsb.ui.manage_password)

        }

    },

    /**
     * Error management in a form (with .alert class)
     *
     * @since 1.0
     *
     */
    error: {
        _element: null,
        _instance: null,
        _dialog: null,
        /**
         * Init the alert
         *
         * @param selector
         * @returns {dsb.error|null}
         *
         * @since 1.0
         *
         */
        init: function (selector = 'form .alert') {
            if ('' === selector) {
                return null;
            }
            this._element = document.querySelector(selector);
            return this
        }

        ,

        /**
         * Print the error message
         *
         * @param error
         * @param _element
         *
         * @returns {dsb}
         *
         * @since 1.0
         */
        message: function (error, _element = 'p span') {
            this._element.querySelector(_element).innerHTML = error;
            this._element.classList.toggle('hidden');
            return this;
        }
    }
    ,

    /**
     * Dashboard management utilities
     *
     * @since 1.0
     *
     */
    utils: {

        /**
         * path info
         *
         * @param string
         *
         * @return {{ext: *, path: *, file: *, name: *}}
         */
        path_info: file => {
            let info = file.match(/(.*?\/)?(([^/]*?)(\.[^/.]+?)?)(?:[?#].*)?$/);
            return {path: info[1], file: info[2], name: info[3], ext: info[4]};
        },

        /**
         * Transform \r\n, \r,\n to <br>
         *
         * @param str to change
         * @returns string with the <br> inside
         *
         * @since 1.0
         *
         */
        nl2br: (str) => {
            if (null !== str) {
                return str.replace(/(\r\n|\r|\n)/gm, '<br>');
            }
        },

        /**
         * Copy a string to the clipboard
         *
         * @param text
         *
         * @since 1.0
         *
         */
        copy_to_clipboard: (text) => {
            navigator.clipboard.writeText(text);
        },

        copy_canvas_to_clipboard(canvas) {
            canvas.toBlob(function (blob) {
                const item = new ClipboardItem({"image/svg": blob});
                navigator.clipboard.write([item]);
            });
        }
        ,

        /**
         * Download a file
         *
         * @param file              file URL
         * @param filename          file name
         *
         * @since 1.0
         *
         */
        download(file, filename = null) {
            let link = document.createElement('a');
            link.setAttribute('href', file);
            if (null !== filename) {
                link.setAttribute('download', filename);
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        ,

        /**
         * Sleep
         *
         * Call as 'await dsb.utils.sleep(duration)'
         *
         * @param   timer   time in milliseconds
         *
         * @since 1.0
         *
         */
        sleep: timer => {
            new Promise(r => setTimeout(r, timer));
        },

        /**
         * format a number
         *
         * @param value     value to format
         * @param digits    number of digits
         * @param type      type/unit
         *
         * TODO get locale.
         *
         * @since 1.0
         *
         */
        format: (value, digits = 0, type = null) => {

            value = dsb.utils.transform(value)

            switch (type) {
                case '%':
                    value = (Number(value)) * 100
                    break;
            }

            if (0 === digits) {
                value = Math.floor(value)
            }


            // Else try to format accordingly
            let locale = 'en'
            return Number(value).toLocaleString(locale, {minimumFractionDigits: digits, maximumFractionDigits: digits})
        },

        format_date_locale_ISO: ({date, timezone = null, with_hour = true}) => {
            let d = date.toLocaleString('sv', {timezone: timezone}).slice(0, 16).replace(' ', 'T')
            return with_hour ? d : d.slice(0, 10)
        },


        /**
         * transform the value (change , to .)
         *
         * @param value     value to format
         *
         * @since 1.0
         *
         */
        transform: (value) => {
            if (typeof value === 'string') {
                value = parseFloat(value.replace(',', '.'))// In case we're in french format
            }
            return value
        },

        /**
         * Transform any 'number' in the right units according a transform weigth
         *
         * @param number        to transform
         * @param transform     weight; ie the divider   (1000 id number in bytes, else 1024) [1000]
         * @returns {string}    the transformation with the right units
         *
         * @since 1.0
         *
         */
        niceBytes: (number, transform = 1000 /*1024*/) => {
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; //TODO externalize for localisation
            let l = 0, n = parseInt(number, 10) || 0;
            while (n >= transform && ++l) {
                n = n / transform;
            }
            return (n.toFixed(n < 10 && l > 2 ? 2 : 2) + ' ' + units[l]);
        },

        /**
         * Get an object from a namespaced string (ie a.b.c), defined in a JS global variable
         * @param namespace
         * @param global
         * @returns {*}
         *
         * @since 1.0
         *
         */
        get_object_from_string: (namespace, global = window) => {
            // https://stackoverflow.com/questions/4981671/access-namespaced-javascript-object-by-string-name-without-using-eval
            return namespace.split('.').reduce(function (a, b) {
                if (typeof (a) == "string") {
                    return global[a][b];
                }
                return a[b];
            });
        },


        /**
         * Remove a key from an array
         *
         * @param array the array
         * @param key   the key to remove from array
         *
         * @returns new array
         *
         * @cince 1.0
         *
         */
        remove_key: (array, key) => {

            let tmp = [];
            for (let x in array) {
                if (x != key) {
                    tmp[x] = array[x];
                }
            }
            return tmp;
        },

        /**
         * Return tri if object_or_array is empty (ie length = 0)
         *
         * @param object_or_array
         */
        is_empty: (object_or_array) => {
            if ('object' === typeof object_or_array) {
                return 0 === Object.keys(object_or_array).length
            }
            if (object_or_array.isArray()) {
                return 0 === object_or_array.length
            }
            return false

        },
    },
    /**
     * UI management
     *
     * @since 1.0
     *
     */
    ui: {
        backdrop: document.getElementById('dsb-backdrop'),

        hide: (element) => {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element.startsWith('#')) {
                    element = document.querySelector(element)
                }

                element.classList.add('dsb-hide')
                element.classList.remove('dsb-show')
                element.classList.remove('dsb-show-flex')
                element.classList.remove('dsb-show-inline-block')
                element.classList.remove('dsb-show-inline-flex')
            }
            return dsb.ui
        },

        show: (element, flex = true) => {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element.includes('#')) {
                    element = document.querySelector(element)
                }

                element.classList.remove('dsb-hide');
                if (flex) {
                    element.classList.add('dsb-show-flex')
                } else {
                    element.classList.add('dsb-show')
                }
            }
            return dsb.ui
        },

        show_block: (element) => {
            if (element !== null) {
                dsb.ui.show(element, false)
            }
        },

        show_inline: (element, flex = true) => {
            if (element !== null) {
                element.classList.remove('dsb-hide');
                if (flex) {
                    element.classList.add('dsb-show-inline-block')
                } else {
                    element.classList.add('dsb-show-inline-flex')
                }
            }
        },


        disable: (element)=> {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element.includes('#')) {
                    element = document.querySelector(element)
                }

                element.setAttribute('disabled','')
            }
            return dsb.ui
        },

        enable: (element)=> {
            if (element !== null) {
                if (!(element instanceof HTMLElement) && element.includes('#')) {
                    element = document.querySelector(element)
                }

                element.removeAttribute('disabled')
            }
            return dsb.ui
        },

        manage_password: () => {
            document.querySelectorAll(".input-group.password .toggle-password").forEach(item => {
                item.addEventListener("click", dsb.ui.toggle_password)
            })
        },

        toggle_password: (event) => {
            const eye = event.currentTarget
            const password = document.querySelector(`[name="${event.currentTarget.dataset.password}"]`);
            const type = password.getAttribute("type") === "password" ? "text" : "password";

            password.setAttribute("type", type);
            eye.querySelector('.show-password').classList.toggle('dsb-hide');
            eye.querySelector('.hide-password').classList.toggle('dsb-hide');
        },

        /**
         *
         * @param tab
         *
         */
        show_tab: (tab) => {
            // If we have some BS tab, let's try to open it
            if ('' !== tab) {
                tab = dsb.ui.get_tab(tab)
                if (null != tab) {
                    dsb.ui.click(tab)
                }
            }
        },

        /**
         * Add shown and hidden events to a tab
         *
         * @param name the tab is designed by a name
         *            In HTML this name is combine with tab- to identify the tab pane
         *            ie : if tab = test we manage tab-test pane
         *
         *
         */
        add_tab_events: (name) => {

            let tab = dsb.ui.get_tab(name)
            if (null !== tab) {

                /**
                 * Add tab/shown/${tab} event when a tab becomes active
                 *                      tabs = {
                 *                          target   : the new active tab
                 *                          previous : the previous active tab
                 *                      }
                 */
                let dsb_shown_event = new Event(`tab/shown/${name}`)
                tab.addEventListener('shown.bs.tab', event => {
                    dsb_shown_event.tabs = {target: event.target, previous: event.relatedTarget}
                    tab.dispatchEvent(dsb_shown_event)
                    // If it is required, we change the URL hash
                    if (event.target.classList.contains('change-url')   // check the required class
                        && event.target?.dataset?.bsToggle === 'tab'      // it should be a tab
                        && window.location.hash) {                      // and the URL should contain #

                        // change the hash, the ural and put them in history
                        let hash = event.target?.dataset?.bsTarget?.split('#tab-')[1]
                        let url = window.location.href.replace(window.location.hash, '#' + hash)
                        let pathname = url.split(window.location.origin)[1]
                        dsb.page.add_to_history(document.title, url, pathname)
                        // change menu info to corresponding item
                        document.querySelector(`.opened[href]`)?.classList.remove('opened')
                        document.querySelector(`[href="${pathname}"]`)?.classList.add('opened')
                    }
                })

                /**
                 * Add tab/hidden/${tab} event when a tab becomes inactive
                 *                      tabs = {
                 *                          target : the inactive tab
                 *                          new    : the new active tab
                 *                      }
                 */
                let dsb_hidden_event = new Event(`tab/hidden/${name}`)
                tab.addEventListener('hidden.bs.tab', event => {
                    dsb_hidden_event.tabs = {target: event.target, new: event.relatedTarget}
                    tab.dispatchEvent(dsb_hidden_event)
                })

            }
        },

        /**
         * Add events to all tabs contained in a HTMLElement
         *
         * @param menu CSS selector that targets an HTML element
         *
         */
        add_tabs_events: (menu) => {
            dsb.ui.list_tabs(menu).forEach(tab => {
                dsb.ui.add_tab_events(tab)
            })
        },

        /**
         * List all tabs contained in a HTMLElement
         *
         * We get the elements with data-bs-toggle="tab"
         *    If data-bs-target = '#tab-<something>" we return <something>
         *                                      else we return the data-bs-target content
         *
         * @param element CSS selector that targets an HTML element
         *
         * @returns []
         *
         */
        list_tabs: (element) => {

            element = document.querySelector(element)

            if (null !== element) {
                let list = []
                element.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
                    let t = tab.dataset.bsTarget
                    if (t) {
                        let l = t.split('#tab-')
                        list.push(l[l[0] === '' ? 1 : 0])
                    }
                })
                return list
            }
            return []
        },

        /**
         * Retrieve the active tab contained in an HTMLElement
         *
         * We get the elements with data-bs-toggle="tab"
         *    If data-bs-target = '#tab-<something>" we return <something>
         *                                      else we return the data-bs-target content
         *
         * We also return an HTMLElement when return_dom set to true
         *
         * @param element CSS selector that targets an HTML element

         * @param return_dom  if true we return an HTMLElement else the tab name (default = false)
         *
         * @returns []
         *
         */
        get_tab_active: (element, return_dom = false) => {

            element = document.querySelector(element)
            if (null !== element) {
                let tab = element.querySelector('.active[data-bs-toggle="tab"]')
                if (return_dom) {
                    return tab
                }
                let t = tab?.dataset.bsTarget
                if (t) {
                    let l = t.split('#tab-')
                    return l[l[0] === '' ? 1 : 0]
                }
            }
            return null
        },

        /**
         * Get a tab with data-bs-target = "#tab-<name>"
         *
         * @param name
         * @returns {Element}
         *
         */
        get_tab: (name) => {
            return document.querySelector(`[data-bs-target="#tab-${name}"]`)
        },

        button_animate: (button, action) => {
            // Bail early
            if (button === null) {
                return
            }
            if (button instanceof PointerEvent) {
                button = button.target
            }

            switch (action) {
                case 'start':
                    button.classList.add('animation','doing')
                    dsb.ui.hide(button.querySelector('.animation.start')).show(button.querySelector('.animation.doing'))
                    break;
                case 'stop':
                case 'reset':
                    dsb.ui.show(button.querySelector('.animation.start')).hide(button.querySelector('.animation.doing'))
                    button.classList.remove('animation','start')

                    break;

            }
        },

        show_pop_content: () => {
            dsb.ui.show_overlay()
            dsb.ui.hide(document.getElementById('content'))
            dsb.ui.show(document.getElementById('pop-content'))
            document.getElementById('pop-content').classList.add('view')
        },

        hide_pop_content: () => {
            document.getElementById('pop-content').classList.remove('view')
            dsb.ui.hide(document.getElementById('pop-content'))
            dsb.ui.show(document.getElementById('content'))
            dsb.ui.hide_overlay()
        },

        show_overlay: () => {
            dsb.ui.backdrop.classList.add('show')
        },
        hide_overlay: () => {
            dsb.ui.backdrop.classList.remove('show')
        },

        show_intermediate_content: (event) => {
            event.preventDefault();
            let template = new Template('#popcont#')
            template.check_link(event.currentTarget.getAttribute('href'))
            template.load({
                template: template,
                force: true,
            })
            dsb.ui.show_pop_content()

            return false
        },

        hide_intermediate_content: () => {
            dsb.ui.hide_pop_content()
        },

        show_refresh: (id) => {
            let item = document.querySelector(`#${id} button .refresh`);
            if (item) {
                item.classList.add('dsb-show', 'fa-spin')
            }
        },

        hide_refresh: (id) => {
            let item = document.querySelector(`#${id} button .refresh`);
            if (item) {
                item.classList.remove('dsb-show', 'fa-spin')
            }
        },

        /**
         * Hide several elements
         *
         * If an element start with . or # it is taken as class or id, otherwise as a bloc
         *
         * @param elements
         *
         * @since 1.0.0
         *
         */
        hide_elements: (elements) => {
            elements.forEach(element => {
                 if (element.startsWith('#')) {
                     // Id
                     dsb.ui.hide(element)
                 } else if (element.startsWith('.')) {
                     // Class
                     document.querySelectorAll(element).forEach(element => {
                         dsb.ui.hide(element)
                     })
                 } else {
                     // Block
                     dsb.ui.hide(document.querySelector(`[data-template="${element}"]`))
                 }
            })
        },

        is_event: (event) => {
            return event instanceof Event
        },

        prevent_default: (event) => {
            if (event instanceof Event) {
                event.preventDefault()
            }
        },

        /**
         * Scroll are only applied on children or element if no cascading
         * @param element
         * @param params
         */
        add_scrolling: (element, params = {}) => {
            let _params = {cascade: true, options: {}, scroll: {}}
            params = {..._params, ...params}

            if (params.cascade) {
                // Try with the parent
                dsb.ui._add_scrolling_to_element(element, params.options)

                // target children with dsb-scroll class
                Array.from(element.getElementsByClassName('dsb-scroll')).forEach(child => {
                    dsb.ui._add_scrolling_to_element(child, params.options, params.scroll)
                })
            } else {
                // target is the element
                dsb.ui._add_scrolling_to_element(element, params.options, params.scroll)
            }
        },

        _add_scrolling_to_element: (element, options = {}, scroll = {}) => {

            // We need to have a 'dsb-scroll' class to launch the scrolling tool
            // But we check also if it has not been already initialised
            let list = element?.classList
            if (list?.contains('dsb-scroll') /*&& !list?.contains('os-host')*/) {
                let params = {
                    overflowBehavior: {
                        x: 'hidden'
                    },
                    scrollbars: {
                        autoHide: 'leave'
                    },
                    paddingAbsolute: true,

                }

                let instance = OverlayScrollbars(element, {...params, ...options})

                // If it is a console, we move the menu outside the scrolling area
                // in order to fix it when scrolling
                if ('CONSOLE' === element.tagName) {
                    element.appendChild(element.getElementsByTagName('console-menu')[0]);
                }

                // Scroll if we have to do it
                if (Object.keys(scroll).length !== 0) {
                    instance.scroll(scroll)
                }
            }

        },
        click: (elem) => {
            // https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/#:~:text=To%20use%20it%2C%20call%20the,a%27)%3B%20simulateClick(someLink)%3B

            // Create our event (with options)
            let evt = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            // If cancelled, don't dispatch our event
            let canceled = !elem.dispatchEvent(evt);
        },

        get_css_var: (variable) => {
            return window.getComputedStyle(document.documentElement).getPropertyValue('--' + variable).trim();
        },

        set_css_var: (variable, value) => {
            document.documentElement.style.setProperty('--' + variable, value);
        },

        chart: {
            export_to_svg: (chart) => {
                chart.ctx.exports.exportToSVG(chart.ctx);
            },
            export_to_csv: (chart, series) => {
                chart.ctx.exports.exportToCSV({
                    series: series,
                    columnDelimiter: ','
                });
            },
        },

        add_alert_close:alert => {
            if (alert !== null ) {
                if (!(alert instanceof HTMLElement) && alert.startsWith('#')) {
                    alert = document.querySelector(alert)
                }
                alert.querySelector('.btn-close').addEventListener('click',event=>{
                    dsb.ui.hide(alert)
                })
            }

        },


        init: (parent = document) => {
            dsb.ui.lists = []
            document.querySelectorAll('select:not(.not-auto-choices)').forEach(select => {
                let id = nanoid()
                if (!select.hasAttribute('id')) {
                    select.id = id
                }

                let limit = select.dataset.limit ?? -1
                let search = select.dataset.search ?? false

                dsb.ui.lists[select.id] = new Choices(select, {
                    itemSelectText: '',
                    silent: true,
                    allowHTML: true,
                    shouldSort: false,
                    searchEnabled: search,
                    renderChoiceLimit: limit,
                })
            })
            dsb.ui.add_scrolling(parent)

        }

    }
    ,


    /**
     * Init all functions
     *
     * @returns {dsb}
     */

    init: async () => {

        // Sometimes, init is called twice, so... //TODO Check this
        if (dsb.initialized) {
            return
        }
        const {default: OverlaysScrollbars} = await import ('/dashboard/assets/vendor/overlay-scrollbars/OverlayScrollbars.js')

        /**
         * First thing to do,manage history
         */
        dsb.page.init()

        /**
         * Then, get user and session information
         */
        dsb.user.init();

        /**
         *  Finally, Initialise other dashboard elements
         */
        dsb.modal.init()
        dsb.error.init()
        dsb.toast.init()

        /**
         *  Add login-logout events
         */
        document.addEventListener('dsb-login', dsb.user.events.login);
        document.addEventListener('dsb-logout', dsb.user.events.logout);

        // Add some body classes at loading if the user is already logged in.
        if (dsb.user.session.context.logged) {
            document.body.classList.add("logged-in");
            document.body.classList.add(dsb.user.session.context.user);
        }

        dsb.template.init()

        /**
         * Once menu has been loaded, we initialise some functionalities
         */
        document.addEventListener('template/load-done/blocks/menu', event => {
            dsb.menu.init(event)
        })

        dsb.ui.init();

        // We need to manage some history retrieval

        dsb.initialized = true;
        console.info('Dashboard init done.')

        return this;
    }
}

export {dsb}