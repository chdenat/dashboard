<?php
	
	/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : end-session.php                                                                                             *
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
        <h5 class="modal-title"><?= _( 'Your session has been expired!' ) ?></h5>
    </div>
    <div class="modal-body">
        <label class="form-label"><?= _( 'Do you you want to log in again?' ) ?></label>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-outline-primary" data-action="dsb.user.logout" data-bs-dismiss="modal">
			<?= _( 'No' ) ?>
		</button>
		<button type="button" data-action="dsb.session.relog" class="btn btn-primary">
			<i class="fas fa-user-circle"></i><?= _( 'Log In' ) ?>
        </button>
    </div>
</form>

