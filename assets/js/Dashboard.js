/**
 *
 *
 */

class Dashboard {
    #cpath = ''
    #js_path = 'assets/js'
    #dir = 'pages'
    pages = []

    #dpath = 'dashboard/' + this.#js_path

    constructor(cpath, dir = 'templates/pages') {
        this.#cpath = `/${cpath}/`
        this.#dir = `${dir}/`
    }


    /**
     * Import page controller.
     *
     * For each page, like  'my-admin', we should have a page controller named MyAdminPage
     * then we instantiate a global variable my_admin=new MyAdminPage('my-admin')
     *
     * @param page
     * @return {Promise<void>}
     */
    importPageController = async (page = null) => {

        if (page === null) {
            page = this.current_page
        }

        if (page) {

            let pascal = `${dsb.utils.kebab2Pascal(page)}Page`
            try {
                await import(`${this.#cpath}${this.#dir}${page}/${pascal}.js`)
                    .then(module => {
                        if (module) {
                            let components = Object.values(module)
                            if (components.length !== 0) {
                                let imported
                                if (Object.values(module)[0]?.module) {
                                    // We use object with module attribute, so we're able
                                    // to create the exported variable, populate it and init it
                                    imported = Object.values(module)[0]
                                    window[imported.module] = imported
                                    imported.init()
                                } else {
                                    // We use Classes, so we're able
                                    // to instantiate the class
                                    window[dsb.utils.kebab2Snake(page)] = new components[0](page)
                                }
                            }
                        }
                    })
                    .catch(error => {
                        console.error(error)
                    })
            } catch(error) {
                console.error('Probably due to legacy :'+error)

            }
        }
    }

    get current_page()  {
        //assume pathname = /pages/<page>

        // We 1st set current to home (can contains #)
        let current = '' // Template.get_home().split('#')[0].split('/').pop()

        let path = location.pathname
        if (path !== '/') {
            current = path.split('/')[2]
        }
        return current
    }
}

export {Dashboard}