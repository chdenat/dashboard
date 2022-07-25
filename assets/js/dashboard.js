/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : dashboard.js
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  3/10/22, 5:25 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/

import {dsb} from "./dsb.js"

document.addEventListener('click', e => {

    let button = e.target;
    let closest = button.closest(':not([data-context])[data-action]')
    if (closest) {
        e.preventDefault();
        let open_modal= (closest.dataset.bsToggle==="modal")
        if (open_modal) {
            dsb.modal.load(closest.dataset.action);
        } else{
            eval(closest.dataset.action).call(null,e,closest)
            return false;
        }
    }
})

