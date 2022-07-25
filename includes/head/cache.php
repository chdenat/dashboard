<?php
	
	/***********************************************************************************************************************
	 *
	 * Project : supervix4
	 * file : cache.php
	 *
	 * @author        Christian Denat
	 * @email contact@noleam.fr
	 * --
	 *
	 * updated on :  1/18/22, 11:20 AM
	 *
	 * @copyright (c) 2022 noleam.fr
	 *
	 **********************************************************************************************************************/
	
	use dashboard\template\Template;
	
	ob_start();
	echo Template::instance()->comments( 'No cache' );
?>
<!--    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"/>-->
<!--    <meta http-equiv="Pragma" content="no-cache"/>-->
<!--    <meta http-equiv="Expires" content="0"/>-->
<?php
	echo Template::instance()->end_comments();
	echo ob_get_clean();