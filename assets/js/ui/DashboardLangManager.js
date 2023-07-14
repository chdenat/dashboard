/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardLangManager.js                                                                                     *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 14/07/2023  18:51                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {YEAR} from 'dsb'
import {Transient} from 'Transient'

var LANG_CHECKED = false

export class DashboardLangManager {
    check = false
    newLang = false
    cookie = null
    LANG_CHECKED = true

    constructor(template = document) {

        if (template !== document) {
            template = template.container
        }
        this.init().then(() => {
            this.initLangSelectors(template)
        })
    }

    get lang() {
        return document.querySelector('html').getAttribute('lang')
    }

    get current() {
        return this.lang
    }

    static getI18n = (context, key = null) => {
        const text = document.querySelector(`text-i18n[context="${context}"]`)
        if (key) {
            return text?.dataset[key]
        }
        return text?.dataset
    }

    setLang = async (event) => {
        let form_data = {
            headers: {'Content-Type': 'multipart/form-data'},
            lang: event.detail.value,
            old: this.current,
            action: 'set-lang'
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
            .then(async data => {
                //save transient
                let transient = new Transient(this.cookie.name)
                transient.delete().then(() => {
                    transient.create(data.cookie.content, YEAR).then(location.reload())
                })

            })
            .catch(error => {
                console.error(error);
            })
    }

    init = async () => {
        /**
         * Check if lang as changed
         * @since 1.1.0
         *
         */
        this.cookie = this.getCookie()
        let transient = new Transient(this.cookie.name)

        if (!LANG_CHECKED) {
            if (this.cookie !== undefined) {

                // it's better to read content from transients
                transient.read().then((content) => {
                    // Fix...for 1.1.x and below
                    if (content !== null && content?.value?.lang !== undefined) {
                        while (content.value?.value) {
                            content.value = content.value.value
                        }
                        content = content.value
                    } else {
                        content = {
                            old: this.cookie.value.old,
                            name: this.cookie.value.name,
                            lang: this.cookie.value.lang,
                            change: this.cookie.value.change
                        }
                    }
                    if (this.cookie && content.change) {

                        // it's a new lang, ok we sync the cookie content
                        Cookies.remove(this.cookie.name, {path: '/'}) // no cookie, no arm !
                        /**
                         * Add a toast if  there is a new lang
                         * @since 1.1.0
                         *
                         */
                        dsb.toast.message({
                            title: DashboardLangManager.getI18n('language/change', 'title'),
                            message: sprintf(DashboardLangManager.getI18n('language/change', 'text'), content.name),
                            type: 'success',
                        })

                    }
                    content.change = false
                    content.old = null
                    transient.update(content, YEAR).then()

                })
            }
        }
        LANG_CHECKED = true

    }
    /**
     * Get the <appli>_lang cookie content
     *
     *
     * @return {null|any}
     */
    getCookie = () => {
        // we do not know the right name, but it's ended with -lang
        for (const cookie in Cookies.get()) {
            if (cookie.endsWith('-lang')) {
                return {name: cookie, value: JSON.parse(Cookies.get(cookie))}
            }
        }
        return null
    }

    initLangSelectors = (template) => {
        const selects = template.querySelectorAll('select.lang-list')
        selects.forEach(select => {

            if (!select.hasAttribute('id')) {
                select.id = nanoid()
            }
            const selectLang = ({classNames}, data) => {
                const CC = data.value.split('_')[1].toLowerCase()
                return (`          <div class="${classNames.item} ${classNames.itemChoice} ${
                    data.disabled ? classNames.itemDisabled : classNames.itemSelectable
                }" data-choice ${
                    data.disabled
                        ? 'data-choice-disabled aria-disabled="true"'
                        : 'data-choice-selectable'
                } data-id="${data.id}" data-value="${data.value}" ${
                    data.groupId > 0 ? 'role="treeitem"' : 'role="option"'
                } title="${data.label}"><i lang="${data.value}" class="fi fis fi-${CC}"></i></div>`)
            }

            dsb.ui.lists[select.id] = new Choices(select, {
                    searchEnabled: false,
                    allowHTML: true,

                    callbackOnCreateTemplates: function (template) {
                        return {
                            item: ({classNames}, data) => {
                                return template(selectLang({classNames}, data))
                            },
                            choice: ({classNames}, data) => {
                                return template(selectLang({classNames}, data))
                            },
                        }
                    },
                },
            )

            dsb.ui.lists[select.id].passedElement.element.addEventListener(
                'change',
                this.setLang,
                false
            );

        })

    }


}