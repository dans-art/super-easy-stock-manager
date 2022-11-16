<title><?php echo __('Super Easy Stock Manager', 'sesm'); ?></title>


<link rel='stylesheet' id='font-awesome-css' href='https://use.fontawesome.com/releases/v5.14.0/css/all.css?wpfas=true‚ type="text/css" media="all" />


<script type="text/javascript">

    var wp_site_url = "<?php echo site_URL(); ?>";
    window.sesm_plugin_root = "<?php echo SESM_MAIN_URL; ?>";

    var historyTemplate = new Object;

    historyTemplate.get = '<?php $t = $this->loadTemplate(SESM_MAIN_DIR . '/templates/theme/frontend-history-item.php');

                            echo trim(preg_replace('/\s\s+/', ' ', $t)); ?>';

    historyTemplate.update = '<?php $t = $this->loadTemplate(SESM_MAIN_DIR . '/templates/theme/frontend-history-item-update.php');

                                echo trim(preg_replace('/\s\s+/', ' ', $t)); ?>';

    historyTemplate.updatePrice = '<?php $t = $this->loadTemplate(SESM_MAIN_DIR . '/templates/theme/frontend-history-item-update-price.php');

                                    echo trim(preg_replace('/\s\s+/', ' ', $t)); ?>';

    historyTemplate.error = '<?php $t = $this->loadTemplate(SESM_MAIN_DIR . '/templates/theme/frontend-history-item-error.php');

                                echo trim(preg_replace('/\s\s+/', ' ', $t)); ?>';

</script>