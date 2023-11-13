<?php

/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : favicon.php                                                                                                 *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 07/11/2023  10:47                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

ob_start();
?>
    <!-- generics -->
    <link rel="icon" type="image/png" sizes="16x16" href="<?= FAVICON ?>favicon-16x16.png">
    <link rel="icon" href="<?= FAVICON ?>favicon-32x32.png" sizes="32x32">
    <link rel="icon" href="<?= FAVICON ?>favicon-57x57.png" sizes="57x57">
    <link rel="icon" href="<?= FAVICON ?>favicon-76x76.png" sizes="76x76">
    <link rel="icon" href="<?= FAVICON ?>favicon-96x96.png" sizes="96x96">
    <link rel="icon" href="<?= FAVICON ?>favicon-128x128.png" sizes="128x128">
    <link rel="icon" href="<?= FAVICON ?>favicon-192x192.png" sizes="192x192">
    <link rel='icon' href='<?= FAVICON ?>favicon-196x196.png' sizes='196x196'>
    <link rel="icon" href="<?= FAVICON ?>favicon-228x228.png" sizes="228x228">

    <!-- Android -->
    <link rel="shortcut icon" sizes="196x196" href=“<?= FAVICON ?>favicon-196x196.png">
    <link rel='shortcut icon' sizes='512x512' href=“<?= FAVICON ?>favicon-512x512.png">

    <!-- iOS -->
    <link rel="apple-touch-icon" href="<?= FAVICON ?>favicon-120x120.png" sizes="120x120">
    <link rel="apple-touch-icon" href="<?= FAVICON ?>favicon-152x152.png" sizes="152x152">
    <link rel="apple-touch-icon" href="<?= FAVICON ?>favicon-180x180.png" sizes="180x180">

<?php
echo ob_get_clean();