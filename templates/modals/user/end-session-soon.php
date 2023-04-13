<?php
	
	/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : end-session-soon.php                                                                                        *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 13/04/2023  18:06                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/

//SessionManager::instance()->start();
?>
<form id="login-after-session" name="login-after-session" action="<?= D_AJAX_POST ?>" enctype="multipart/form-data">
    <div class="modal-header">
        <h5 class="modal-title"><i class="fa-regular fa-user-clock text-warning"></i>&nbsp;<?= _( 'Your session will expire soon!' )
            ?></h5>
    </div>
    
    <div class="modal-body">
        <label class="form-label">
            <?= _( 'You\'re being timeout in <span id="end-session-timer"></span> seconds due to inactivity.')?>
            <br>
	        <?= _( 'Please choose to stay signed in or to logout.')?>

        </label>
    </div>
    
    <div class="modal-footer">
        <button type="button" data-bs-dismiss="modal"  data-action="dsb.user.logout" class="btn btn-outline-primary">
            <?= _( 'Log out' ) ?>
        </button>
        <button type="button" data-bs-dismiss="modal" data-action="dsb.session.trapActivity" class="btn
        btn-primary">
            <i class="fas fa-user-circle"></i><?= _( 'Stay Logged in' ) ?>
        </button>
    </div>
</form>

