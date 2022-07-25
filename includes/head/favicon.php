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
	echo Template::instance()->comments( 'fav icon' );
?>
    <link rel="icon" href="data:,">
    <link rel="apple-touch-icon" sizes="180x180" href="<?=FAVICON?>apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="<?=FAVICON?>favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="<?=FAVICON?>favicon-16x16.png">
    <link rel="manifest" href="<?=FAVICON?>site.webmanifest">
<?php
	echo Template::instance()->end_comments();
	echo ob_get_clean();