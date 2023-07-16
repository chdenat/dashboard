/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : Responsive.js                                                                                               *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 16/07/2023  08:32                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {DashboardUI} from '/dashboard/assets/js/ui/DashboardUI.js'


export class Responsive {


    static SM_BREAKPOINT = DashboardUI.getCSSVariable('dsb-breakpoint-sm')
    static MD_BREAKPOINT = DashboardUI.getCSSVariable('dsb-breakpoint-md')
    static LG_BREAKPOINT = DashboardUI.getCSSVariable('dsb-breakpoint-lg')

    static classes = {
        small: 'small-device',
        medium: 'medium-device',
        large: 'large-device',
        extraLarge: 'extra-large-device'
    }

    static isSmallDevice = () => {
        if (this.width() <= this.SM_BREAKPOINT) {
            this.cleanClasses(this.classes.small)
            return true
        }
        return false
    }
    static isMediumDevice = () => {
        if (this.width() <= this.MD_BREAKPOINT && this.width() > this.SM_BREAKPOINT) {
            this.cleanClasses(this.classes.medium)
            return true
        }
        return false

    }
    static isLargeDevice = () => {
        if (this.width() <= this.LG_BREAKPOINT && this.width() > this.MD_BREAKPOINT) {
            this.cleanClasses(this.classes.large)
            return true
        }
        return false

    }
    static isExtraLargeDevice = () => {
        if (this.width() > this.LG_BREAKPOINT) {
            this.cleanClasses(this.classes.extraLarge)
            return true
        }
        return false

    }

    static cleanClasses = (current = null) => {
        for (const class_ in this.classes) {
            if (this.classes[class_] !== current) {
                document.body.classList.remove(this.classes[class_])
            } else {
                document.body.classList.add(this.classes[class_])
            }
        }
    }

    static width = () => {
        return document.getElementById('content').offsetWidth
    }

}