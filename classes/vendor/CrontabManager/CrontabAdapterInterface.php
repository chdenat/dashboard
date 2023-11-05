<?php

/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : CrontabAdapterInterface.php                                                                                 *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 19/10/2023  10:10                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

namespace TiBeN\CrontabManager;

/**
 * Crontab adapter.
 * Retrieve and write cron jobs data using the "crontab" command line.
 *
 * @author TiBeN
 */
interface CrontabAdapterInterface {

    /**
     * Read the crontab and return
     * raw data
     *
     * @return String $output the crontab raw data
     */
    public function readCrontab();

    /**
     * Write the raw crontab data to the crontab.
     *
     * @param String $crontabRawData
     */
    public function writeCrontab($crontabRawData);
}