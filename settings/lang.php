<?php

/***********************************************************************************************************************
 *
 * Project : supervix4
 * file : lang.php
 *
 * @author  Christian Denat
 * @email contact@noleam.fr
 * --
 *
 * updated on :  1/18/22, 11:50 AM
 *
 * @copyright (c) 2022 noleam.fr
 *
 **********************************************************************************************************************/
	
	
	/**
	 * Localisation management
	 */
	const PATH_RACINE_LOCALE = '$/i18n/locale';                    // Localisation
	const LANGUE_DEFAULT     = 'fr_FR';                            // Yes , we speak french ...
	
	const LANGUES = [
		'de_DE' => 'Deutsch',
		'en_US' => 'English',
		'es_ES' => 'Español',
		'fr_FR' => 'Français',
		'it_IT' => 'Italiano',
		'ko_KR' => '한국어',
		'pt_PT' => 'Português',
		'sl_SI' => 'Slovenščina',
		'la_LA' => 'Latin',
	];
	
	// Language is saved also in a file    TODO what ????
	const PATH_FILE_LANGUAGE='$/settings/langue.lg';