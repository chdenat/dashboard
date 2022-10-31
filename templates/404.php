<?php
	
	use dashboard\template\Template;
	
	$params = Template::instance()->get_template_parameters();
?>
<div class="page-404">
    <h3><?= _( 'Page not found' ) ?></h3>
    <span id="error"><i class="fa-regular fa-compass"></i>&nbsp;<?= sprintf( _( 'You tried to reach "<strong>%s</strong>" ...' ), $params['url'] ) ?></span>
    
    <p>
		<?= _( 'What could be the cause of this error?' ) ?>
    </p>
    <ul>
        <li><?= _( 'This page does not exist.' ) ?>

        </li>
        <li>
			<?= _( 'You do not have the required privileges to see it.' ) ?>
        </li>
    </ul>
    <a class="btn btn-primary" href="/"><i class="fa-regular fa-house"></i><?= _( 'Home' ) ?></a>
</div>