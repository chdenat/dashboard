<?php
	
	/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : skeleton.php
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  7/1/22, 4:44 PM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/
  
	use dashboard\template\Template;
 
?>

<?= Template::instance()->comments( "user management modal" ) ?>

<div class="modal fade"  data-bs-backdrop="static"  id="dashboard-modal" tabindex="-1"
     aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
        </div>
    </div>
</div>

<?= Template::instance()->end_comments() ?>
