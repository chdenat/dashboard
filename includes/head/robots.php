<?php

/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : robots.php
 *
 * @author  Christian Denat
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
	echo Template::instance()->comments( 'Robots' );
?>
    <meta name="robots" content="noINDEX, noFOLLOW">
<?php
	echo Template::instance()->end_comments();
	echo ob_get_clean();