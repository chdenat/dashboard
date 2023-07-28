<?php

/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : shelteradmin                                                                                             *
 * File : skeleton.php                                                                                                *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 28/07/2023  09:59                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

use dashboard\template\Template;

?>

<?= Template::instance()->comments("user management modal") ?>

    <div class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" id="dashboard-modal" tabindex="-1"
         aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <block class="modal-content" data-template="" id="dsb-modal-content" data-template-id="#modal#"></block>
        </div>
    </div>

<?= Template::instance()->end_comments() ?>