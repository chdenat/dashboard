<?php
	/**********************************************************************************************************************
 *                                                                                                                    *
 * Project : dashboard                                                                                                *
 * File : texts-4-i18n.php                                                                                            *
 *                                                                                                                    *
 * @author: Christian Denat                                                                                           *
 * @email: contact@noleam.fr                                                                                          *
 *                                                                                                                    *
 * Last updated on : 20/02/2023  20:12                                                                                *
 *                                                                                                                    *
 * Copyright (c) 2023 - noleam.fr                                                                                     *
 *                                                                                                                    *
 **********************************************************************************************************************/
	
	/**
	 * Define texts to translate in a <text-i18n></text-i18n> pseudo HTML element and then to be used
	 * in Javascript modules.
	 *
	 * IN HTML, in this file, you should declare the texts to translate.
	 *
	 *      <text-i18n context="<some-context>"
	 *                 data-title="<?= _( '<some title here>' ) ?>"
	 *                 data-text="<?= _( '<some text here>' ) ?>"
	 *                 data-other="<?= _( '<some other text here>' ) ?>">
	 *      </text-i18n>
	 *
	 *
	 * Then, on JS side us  dsb.ui.get_text_i18n  function to retrieve translated texts.
	 *
	 *       dsb.ui.get_text_i18n(<some-context>')         :  {
	 *                                                              title:translation of '<some title here>'
	 *                                                              text : translation of '<some text here>'
	 *                                                        }
	 *       dsb.ui.get_text_i18n(<some-context>','title') :  translation of '<some title here>'
	 *       dsb.ui.get_text_i18n(<some-context>').title   :  translation of '<some title here>'
	 *
	 */
?>

<!--
User login, logout and change password
-->

<text-i18n context="user/log-in"
           data-title="<?= _( 'Log in' ) ?>"
          data-text="<?= _( 'User %s has been logged in successfully!' ) ?>">
</text-i18n>

<text-i18n context="user/log-out"
          data-title="<?= _( 'Log Out' ) ?>"
          data-text="<?= _( 'User %s has been logged out!' ) ?>">
</text-i18n>

<text-i18n context="user/new-password"
           data-title="<?= _( 'New password' ) ?>"
           data-text="<?= _( 'Password changed for user %s.' ) ?>">
</text-i18n>

<!--
Console
-->

<text-i18n context="console/copy-text"
           data-title="<?= _('Copy content') ?>"
           data-text="<?= _('Console content copied to the clipboard!') ?>">
</text-i18n>
<text-i18n context="console/copy-text-error"
           data-title="<?= _('Copy content') ?>"
           data-text="<?= _('An error occurs during copy!') ?>">
</text-i18n>
<text-i18n context="console/export-text"
           data-title="<?= _('Export content') ?>"
           data-text="<?= _('Console content exported!') ?>">
</text-i18n>
<text-i18n context="console/clear"
           data-title="<?= _('Clear Console') ?>"
           data-text="<?= _('Console content cleared!') ?>">
</text-i18n>

<!--
APEX CHART Translation
-->

<text-i18n context="chart/csv"
           data-title="<?= _('Export data') ?>"
           data-text="<?= _('The chart data has been exported to CSV!') ?>">
</text-i18n>
<text-i18n context="chart/svg"
           data-title="<?= _('Export Chart') ?>"
           data-text="<?= _('The chart has been exported to SVG format!') ?>">
</text-i18n>
<text-i18n context="toolbar/csv" data-text="<?= _('Export data in CSV format') ?>"></text-i18n>
<text-i18n context="toolbar/svg" data-text="<?= _('Export chart in SVG format') ?>"></text-i18n>
<text-i18n context="toolbar/zoom" data-text="<?= _('Selection Zoom') ?>"></text-i18n>
<text-i18n context="toolbar/pan" data-text="<?= _('Panning') ?>"></text-i18n>
<text-i18n context="toolbar/reset" data-text="<?= _('Reset Zoom') ?>"></text-i18n>

<!--
Language
 change
 -->

<text-i18n
        context="language/change"
        data-title="<?= _('New Language') ?>"
        data-text="<?= _('Language set to %s!') ?>">
</text-i18n>