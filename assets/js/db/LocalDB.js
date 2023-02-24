/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : LocalDB.js                                                                                                  *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 24/02/2023  15:29                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
import {openDB} from 'idb';


export class LocalDB {

    #db = null
    #version = 1
    #stores = 'mystore'
    #name = 'mydb'

    #transients = 'transients'

    constructor({
                    name = this.#name,
                    store = this.#stores,
                    manageTransients = false,
                    version = this.#version
                }) {

        if (!(store instanceof Array)) {
            store = [store]
        }
        if (manageTransients) {
            store.push(this.#transients)
        }

        this.#stores = store
        this.#name = name

        let tables = this.#stores // passe dto upgrad contest
        this.#db = openDB(this.#name, this.#version, {
            upgrade(db, old_version, new_version) {
                tables.forEach(table => {
                    db.createObjectStore(table);
                })
            },
        })
    }

    /**
     * Return the transient store name
     *
     * @return {*|null}
     */
    get transientStore() {
        if (this.#stores.includes(this.#transients)) {
            return this.#transients
        }
        return null
    }

    /**
     * Get a value in current store
     *
     *
     * @param key           The key used
     * @param store
     * @param with_ttl      If false (default), get returns only the value
     *                      else it returns value+ttl, ie the full DB data content
     * @return {Promise<null|any>}
     */
    get = async (key,store,with_ttl=false) => {

        // Get the normal value
        const data = await (await this.#db).get(store, key);
        if (!data) {
            return null
        }

        // If we need ttl, we return the full object
        if (with_ttl) {
            return data
        }

        // If ttl exists and is expired, let's return null
        if (data._ttl_ && (new Date()).getTime() > data._ttl_) {
            await (await this.#db).delete(store, key);
            return null
        }
        // else returns the object stored
        return data.value

    }

    /**
     * Add a key/value with optional ttl
     *
     *
     * @param key
     * @param value         any kind of value
     * @param store
     * @param ttl           in milliseconds
     *
     * @return {Promise<*>}
     */
    set = async (key, value, store,ttl = 0) => {

        let data = {
            value: value
        }

        if (ttl > 0) {
            data._ttl_ = (new Date()).getTime() + ttl
        }

        return (await this.#db).put(store, data, key);

    }

    /**
     *  Update a key with a new value
     *
     * @param key
     * @param value
     * @param store
     * @param ttl       in milliseconds
     * @return {Promise<*>}
     */
    update = async (key,value,store,ttl = 0) => {
        const old = await this.get(key, store, true)
        if (old) {
            await this.delete(key, store)
            if (ttl === 0) {
                ttl = old._ttl_
            }
        }
        return await this.set(key,value,store,ttl);
    }

    /**
     * delete a key
     *
     * @param key
     * @param store
     * @return {Promise<*>}
     */
    delete=async (key,store) => {
        return (await this.#db).delete(store, key);
    }

    /**
     * Clear a store
     *
     * @return {Promise<*>}
     */
   clear =  async (store)=>  {
        return (await this.#db).clear(store);
    }

    /**
     * Get all keys
     *
     * @return {Promise<IDBRequest<IDBValidKey[]>>}
     */
    keys = async (store) => {
        return (await this.#db).getAllKeys(store);
    }


}