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
        <button type="button" data-bs-dismiss="modal" data-action = "dsb.user.session.trap_activity" class="btn
        btn-primary">
            <i class="fas fa-user-circle"></i><?= _( 'Stay Logged in' ) ?>
        </button>
    </div>
</form>

