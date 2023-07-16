/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : dashboard.js                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 16/07/2023  08:36                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {dsb} from '/dashboard/assets/js/dsb.js'

document.addEventListener('click', e => {

    let button = e.target;
    let closest = button.closest(':not([data-context])[data-action]')
    if (closest) {
        e.preventDefault();
        let open_modal = (closest.dataset.bsToggle === "modal")
        if (open_modal) {
            dsb.modal.load(closest.dataset.action);
        } else {
            eval(closest.dataset.action).call(null, e, closest)
            return false;
        }
    }
})