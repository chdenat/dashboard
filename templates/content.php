<?php

/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : content.php                                                                                                 *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 19/06/2023  16:32                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

global $template;

$content = $template->get_template_parameters()['template'] ?? '';
?>

<div id="main">
    <block id="menu-container" class="collapse collapse-horizontal show"
           data-template="blocks/menu"
           data-template-id="#menu#"
           data-animation-load="true"
    >

    </block>
    <div id="content-wrapper">

        <div class="breadcrumbs">breadcrumbs</div>
        <block id="content" data-template="" data-template-id="#content#"></block>
        <block id="pop-content" data-template="" data-template-id="#popcont#"></block>

        <div id="loader">
            <div class="loader-content">
                <div class="loader-circle">
                    <div class="loader-circle-content">
                    </div>
                </div>

                <div id="hourglass" class="fa-stack fa-4x">
                    <i class="fa-regular fa-stack-1x fa-hourglass-start"></i>
                    <i class="fa-regular fa-stack-1x fa-hourglass-half"></i>
                    <i class="fa-regular fa-stack-1x fa-hourglass-end"></i>
                    <i class="fa-regular fa-stack-1x fa-hourglass-end"></i>
                    <i class="fa-regular fa-stack-1x fa-hourglass-o"></i>
                </div>
            </div>
        </div>

        <script id="php-download">let dsb_downloaded_from_php = true;</script>
    </div>
</div>
