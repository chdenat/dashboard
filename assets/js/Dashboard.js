/**
 *
 *
 */
//import {Template} from "/dashboard/assets/js/Template.js";

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


    import_module = async (page = null, js = 'page.js') => {
        if (page === null) {
            page = this.current_page
        }

        if (page) {
            try {
                await import(`${this.#cpath}${this.#dir}${page}/${js}`)
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
                                    // to create and populate the exported variable
                                    imported=Object.keys(module)[0]
                                    window[imported] = components[0]
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