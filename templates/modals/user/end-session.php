<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : end-session.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  4/26/22, 7:54 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	use dashboard\user\SessionManager;
	
	//SessionManager::instance()->start();
?>
<form id="login-after-session" name="login-after-session" action="<?= D_AJAX_POST ?>" enctype="multipart/form-data">
    <div class="modal-header">
        <h5 class="modal-title"><?= _( 'Your session has been expired ! ' ) ?></h5>
    </div>
    <div class="modal-body">
        <label class="form-label"><?= _( 'Do you you want to log in again ?' ) ?></label>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
			<?= _( 'No' ) ?>
        </button>
        <button type="button" data-action="dsb.user.session.relog"  class="btn btn-primary">
            <i class="fas fa-user-circle"></i><?= _( 'Log In' ) ?>
        </button>
    </div>
</form>

