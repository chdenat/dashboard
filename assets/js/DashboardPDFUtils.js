/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : DashboardPDFUtils.js                                                                                        *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 01/07/2023  12:20                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

import {DateTime} from 'luxon'

export class DashboardPDFUtils {

    static fromHTML = async (element, file) => {


        if (typeof element === 'string') {
            element = document.querySelector(element)
        }

        await window.html2canvas(element).then((canvas) => {
            const componentWidth = element.offsetWidth
            const componentHeight = element.offsetHeight

            const orientation = componentWidth >= componentHeight ? 'l' : 'p'

            const imgData = canvas.toDataURL('image/png')
            const pdf = new window.jspdf.jsPDF({
                orientation,
                unit: 'px',
                format: 'a4'
            })

            const margin = 40 //px
            const fileName = `${file}.pdf`

            pdf.internal.pageSize.width = componentWidth + 2 * margin
            pdf.internal.pageSize.height = componentHeight + 2 * margin

            pdf.addImage(imgData, 'PNG', margin, margin, componentWidth, componentHeight)
            pdf.text(fileName, margin, margin / 2)
            pdf.text(`Created on ${DateTime.now().toLocaleString(DateTime.DATETIME_FULL)}`,
                pdf.internal.pageSize.width - margin, pdf.internal.pageSize.height - margin / 2, {
                    align: 'right'
                })
            pdf.save(fileName)
        })
    }

}