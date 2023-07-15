/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardResponsiveTabs.js                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 15/07/2023  17:01                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {DashboardUI as UI} from 'DashboardUI'

export class DashboardResponsiveTabs {

    #tabs = null
    #links = []
    #select = null

    constructor(tabs) {

        this.#tabs = tabs

        //Bail early if there is already a select
        if (document.documentElement.contains(tabs.querySelector('select'))) {
            return false
        }

        // Get all the required information
        tabs.querySelectorAll('.nav-link').forEach(link => {
            this.#links.push({
                label: link.innerHTML,
                value: link.dataset.bsTarget,
                instance: link,
                selected: link.classList.contains('active'),
                disabled: false,
            })

        })

        // Build the choices list
        this.#select = new Choices(this.#buildSelect(), {
            itemSelectText: '',
            silent: true,
            allowHTML: true,
            searchEnabled: false,
            shouldSort: false,

            callbackOnCreateTemplates: function (template) {
                return {
                    item: ({classNames}, data) => {
                        const label = data.label
                        return template(`
          <div class="${classNames.item} ${
                            data.highlighted
                                ? classNames.highlightedState
                                : classNames.itemSelectable
                        } ${
                            data.placeholder ? classNames.placeholder : ''
                        }" data-item data-id="${data.id}" data-value="${data.value}" ${
                            data.active ? 'aria-selected="true"' : ''
                        } ${data.disabled ? 'aria-disabled="true"' : ''}>
${UI.decodeHTMLEntities(label)}
          </div>
        `)
                    },
                    choice: ({classNames}, data) => {
                        const label = data.label
                        return template(`
          <div class="${classNames.item} ${classNames.itemChoice} ${
                            data.disabled ? classNames.itemDisabled : classNames.itemSelectable
                        }" data-select-text="${this.config.itemSelectText}" data-choice ${
                            data.disabled
                                ? 'data-choice-disabled aria-disabled="true"'
                                : 'data-choice-selectable'
                        } data-id="${data.id}" data-value="${data.value}" ${
                            data.groupId > 0 ? 'role="treeitem"' : 'role="option"'
                        }>
            ${UI.decodeHTMLEntities(label)}
          </div>
        `)
                    },
                };
            },
        })

        this.synchronizeTabs()
        this.synchronizeSelection()


    }

    /**
     * Let's sync the tabs when user selects an item in the select box
     */
    synchronizeTabs = () => {
        // Sync with tabs
        this.#select.passedElement.element.addEventListener('choice', (event) => {
            dsb.ui.click((this.#links.find(element => element.value === event.detail.choice.value)).instance)
        })
    }

    /**
     * Let's synchronize the select box when user clicks on a tab
     */
    synchronizeSelection = () => {

        this.#links.forEach((tab) => {
            tab.instance.addEventListener('click', (event) => {
                this.#select.setChoiceByValue(event.currentTarget.dataset.bsTarget)
            })
        })
    }

    /**
     * Build the select box
     *
     * @return {HTMLSelectElement}
     */
    #buildSelect = () => {
        const select = document.createElement("select");
        select.id = `select-${this.#tabs.id}`;
        this.#tabs.appendChild(select);

        this.#links.forEach(link => {
            if (link.instance.style.display !== 'none') {
                const option = document.createElement("option");
                option.text = link.label
                option.value = link.value
                option.selected = link.selected
                select.add(option);
            }
        })
        return select

    }

    #alreadyExists = () => {

    }

}