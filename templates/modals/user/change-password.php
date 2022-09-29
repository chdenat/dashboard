<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : change-password.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/24/22, 6:37 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	use dashboard\user\SessionManager;
	
	SessionManager::instance()->start();

?>
<form id="change-password" name="change-password" action="<?= D_AJAX_POST ?>" enctype="multipart/form-data">
    <input id="user" name="user" type="hidden" value="<?= $_SESSION['user'] ?? 'admin' ?>">
    <div class="modal-header">
        <h5 class="modal-title"><?= _( 'Change your password' ) ?></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
        <div class="alert alert-danger dsb-hide" role="alert">
            <p class="mb-0"><i class="me-2 fas fa-exclamation-triangle"></i><span></span></p>
        </div>
        <label class="form-label" for="new-password"><?= _( "New password" ) ?></label>
        <div class="input-group password">
            <input class="form-control" id="new-password" name="new-password"
                   type="password" autocomplete="new-password" aria-autocomplete="inline">
            <span class="input-group-text toggle-password" data-password="new-password">
                <i class="fa-regular fa-eye show-password" title="<?= _( 'Show password' ) ?>"></i>
                <i class="fa-regular fa-eye-slash hide-password dsb-hide" title="<?= _( 'Hide password' ) ?>"></i>
             </span>
        </div>

        <label class="form-label" for="confirm-password"><?= _( "Confirm new password" ) ?></label>
        <div class="input-group password">
            <input class="form-control" id="confirm-password" name="confirm-password"
                   type="password" autocomplete="new-password" aria-autocomplete="inline">
            <span class="input-group-text toggle-password" data-password="confirm-password">
                <i class="fa-regular fa-eye show-password" title="<?= _( 'Show password' ) ?>"></i>
                <i class="fa-regular fa-eye-slash hide-password dsb-hide" title="<?= _( 'Hide password' ) ?>"></i>
            </span>
        </div>

        <label class="form-label" for="old-password"><?= _( "Current password" ) ?></label>
        <div class="input-group password">
            <input class="form-control" id="old-password" name="old-password"
                   type="password" autocomplete="current-password" aria-autocomplete="inline">
            <span class="input-group-text toggle-password" data-password="old-password">
                <i class="fa-regular fa-eye show-password" title="<?= _( 'Show password' ) ?>"></i>
                <i class="fa-regular fa-eye-slash hide-password dsb-hide" title="<?= _( 'Hide password' ) ?>"></i>
            </span>
        </div>

    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><?= _( 'Cancel' ) ?></button>
        <button type="button" data-action="dsb.user.change_password"
                class="btn btn-primary"><?= _( 'Change' ) ?></button>
    </div>

</form>
