<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : logout.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/24/22, 6:43 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	use dashboard\user\SessionManager;
	
	SessionManager::instance()->start();
?>
<form id="logout-confirm" name="logout-confirm" action="<?= D_AJAX_POST ?>" enctype="multipart/form-data">
    <input id="user" name="user" type="hidden" value="<?=$_SESSION['user']??''?>">
    <div class="modal-header">
        <h5 class="modal-title"><?= _( 'Logout confirmation' ) ?></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
        <label class="form-label"><?= _( 'Are you sure you want to log out ?' ) ?></label>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><?= _( 'Cancel' )
			?></button>
        <button type="button" data-action="dsb.user.logout" class="btn btn-primary"><?= _( 'Log out' )
			?></button>
    </div>
</form>

