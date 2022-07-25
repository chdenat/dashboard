<?php global $template ?>

<!DOCTYPE html>
<html <?= $template->html_classes() ?>>

<head>
    <title>Idefix</title>
    <meta name="author" lang="fr" content="O. Cart.">
    <meta name="keywords" content="">
    <meta name="description" content="Changer Mot de passe">
	<?= $template->head_end() ?>
</head>

<body <?= $template->body_classes() ?>>
<?php $template->body_start() ?>

<div id="dsb-backdrop"></div>
<div class="container-fluid" id="body-wrapper">
    
    <header id="header">
		<block data-template="blocks/header"><?php $template->include_block( 'blocks/header' ) ?></block>
    </header>
    