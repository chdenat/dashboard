/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : BlockAnimationScheduler.js                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 08/07/2023  20:01                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {Block} from 'Block'

export class BlockAnimationScheduler {
    #total = 0
    #counter = 0
    #name = ''

    DOING = 1
    STOP = 2
    status = 0

    constructor(name, total) {
        this.name = name
        this.total = total
        this.counter = 0
    }

    get name() {
        return this.#name
    }

    set name(name) {
        this.#name = name
    }

    get total() {
        return this.#total
    }

    set total(total) {
        this.#total = total
    }

    get counter() {
        return this.#counter
    }

    set counter(counter) {
        this.#counter = counter
    }

    reset = () => {
        this.status = 0
        this.counter = 0
    }

    start = (data) => {
        this.counter = this.counter + 1
        if (this.counter === 1 && this.status !== this.DOING) {
            Block.event.emit(`scheduler/animation/start/${this.name}`, data)
            this.status !== this.DOING
        }
    }

    complete = (data) => {
        if (this.counter >= this.total && this.status !== this.STOP) {
            Block.event.emit(`scheduler/animation/complete/${this.name}`, data)
            this.status = this.STOP
        }
    }
}