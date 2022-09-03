<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : toast.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/30/22, 7:46 PM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
?>
<div class="toast-container position-absolute bottom-0 end-0" id="dsb-toast">
    <div class="toast text-white" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto"><span></span></strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body"></div>
    </div>
</div>

<div class="toast-container position-absolute bottom-0 end-0" id="dsb-permanent-toast" data-bs-autohide="false">
    <div class="toast text-white" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
            <strong class="me-auto"><span></span></strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            <div class="toast-message"></div><a class="dsb-hide btn"></a>
        </div>
    </div>
</div>