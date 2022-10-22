<?php
    global $template;
	use dashboard\I18n;
    ?>

<!DOCTYPE html>
<html <?= $template->html_classes() ?> lang="<?=	CURRENT_LANG?>">

<head>
    <title>Idefix</title>
	<?= $template->head_end() ?>
</head>

<body <?= $template->body_classes() ?>>
<?php $template->body_start() ?>

<div id="dsb-backdrop"></div>
<div class="container-fluid" id="body-wrapper">
    
    <header id="header">
		<block data-template="blocks/header"><?php $template->include_block( 'blocks/header' ) ?></block>
    </header>
    