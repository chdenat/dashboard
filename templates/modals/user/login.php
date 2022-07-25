<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : login.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/24/22, 6:35 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	use dashboard\user\SessionManager;
	
	SessionManager::instance()->start();

?>

<form id="login" name="login" action="<?= D_AJAX_POST ?>" enctype="multipart/form-data">
    <div class="modal-header">
        <h5 class="modal-title"><?= _( 'Log in' ) ?></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">

        <div class="alert alert-danger hidden" role="alert">
            <p class="mb-0"><i class="me-2 fas fa-exclamation-triangle"></i><span></span></p>
        </div>

        <fieldset disabled class="no-border">
            <label for="user" class="form-label"><?= _( 'User name' ) ?></label>
            <input name="user" class="form-control" type="input" id="user"
                   value="<?= $username = 'admin' ?>"/>
        </fieldset>
        
        <label for="password" class="form-label"><?= _( 'Password' ) ?></label>
        <div class="input-group password">
            <input class="form-control" id="password" name="password"
                   type="password"  autocomplete="current-password" aria-autocomplete="inline">
            <span class="input-group-text toggle-password" data-password="password">
                                    <i class="fa-regular fa-eye show-password" title="<?= _( 'Show password' ) ?>"></i>
                                    <i class="fa-regular fa-eye-slash hide-password dsb-hide"
                                       title="<?= _( 'Hide password' )
                                       ?>"></i>
                                </span>
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><?= _( 'Cancel' ) ?></button>
        <button type="submit" data-action="dsb.user.login" class="btn btn-primary"><?= _( 'Sign In' )
			?></button>
    </div>
</form>

