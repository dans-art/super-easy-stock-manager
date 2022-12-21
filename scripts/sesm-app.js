/* eslint-disable max-len */
/* eslint-disable linebreak-style */
'use strict';

/**
 * Main class
 */
class SesmMain {
  sesm_do = '';
  field_names = {};
  scanner = {};
  version = '1.3.6';

  /**
   * Imports the modules once the document is ready
   * Loads event listener and activates sesm
   */
  construct() {
    jQuery(document).ready(async function() {
      // Check if the container for the plugin exists. If not, it skips the rest
      if (jQuery('#sesm_container').length !== 1) {
        return false;
      }
      // Import the ajax and template handler
      await import('./modules/ajax.js').then((module) => {
        sesmScripts.ajax = new module.SesmAjax;
      });
      await import('./modules/template.js').then((module) => {
        sesmScripts.template = new module.SesmTemplate;
      });

      // Load the templates
      await sesmScripts.template.load_default_templates();

      // Add the default field names
      sesmScripts.load_field_names();

      // Add event listeners
      sesmScripts.add_event_listener();
      sesmScripts.activate_sesm();

      sesmScripts.is_mobile();
    });
  }

  /**
   * Loads the names of the fields into the object
   */
  load_field_names() {
    this.field_names.price_title = __('Price', 'super-easy-stock-manager');
    this.field_names.weight_title = __('Weight', 'super-easy-stock-manager');
    this.field_names.quantity_title = __('Quantity', 'super-easy-stock-manager');
    this.field_names.sku_title = __('SKU', 'super-easy-stock-manager');
    this.field_names.iconclass = '';
  }
  /**
     * Checks if the device is a mobile device or not.
     * @return {bool} true if mobile, otherwise false
     */
  is_mobile() {
    if (jQuery(window).width() < 500) {
      return true;
    }
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      return true;
    }
    return false;
  }

  /**
     * Adds the event listeners
     */
  add_event_listener() {
    jQuery('#sesm_buttons button').click(function(item) {
      sesmScripts.sesm_do = jQuery(item.currentTarget).data('do');

      // reset all
      jQuery('#sesm_input .quant_flex_group').hide();
      jQuery('#sesm_input .price_flex_group').hide();
      jQuery('#sesm_buttons button.button-active').removeClass('button-active');

      // Show the fields again, focus and set class
      jQuery('#sesm_sku_input').slideDown('fast');
      jQuery('#sesm_container #selection-indicator').slideDown('fast');
      jQuery(item.currentTarget).addClass('button-active');

      // Auto focus if device is a mobile device.
      // @todo: Add option to enable or disable autofocus
      if (sesmScripts.is_mobile()) {
        // Is mobile
        sesmScripts.show_scan_container();
      } else {
        jQuery('#sesm_sku_input').focus();
      }

      sesmScripts.move_selection_indicator();

      switch (sesmScripts.sesm_do) {
        case 'add_quantities':
          jQuery('.sesm_options .quant_flex_group').slideDown('fast');
          break;
        case 'update_price':
          jQuery('.sesm_options .price_flex_group').slideDown('fast');
          break;
        case 'get_product':
          break;
      }
    });

    jQuery('#scan-button').click(() => {
      // Hide and show button
      jQuery('#scan-button').hide();
      jQuery('#scan-button-active').show();

      // Open scan application
      sesmScripts.scanner = new Html5QrcodeScanner(
          'scanner-container',
          {
            fps: 10,
            qrbox: {width: 250, height: 250},
            useBarCodeDetectorIfSupported: true,
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
            defaultZoomValueIfSupported: 2,
          });

      sesmScripts.scanner.render(sesmScripts.onScanSuccess, sesmScripts.onScanFailure);
    });

    jQuery('#scan-button-active').click(() => {
      // Hide and show button
      jQuery('#scan-button').show();
      jQuery('#scan-button-active').hide();

      sesmScripts.scanner.clear();
    });

    jQuery(document).on('keyup', async function(s) {
      if (s.which == 13) {
        sesmScripts.fire_ajax();
      }
    }),
    jQuery('#add_quant_btn').click(function() {
      sesmScripts.changeQuantity(true);
    }),
    jQuery('#remove_quant_btn').click(function() {
      sesmScripts.changeQuantity(false);
    });

    /**
       * On value change, validate the input
       */
    jQuery('#sesm_container input').keyup((e) => {
      // Ignore the check if the tab, ctrl or shift key is pressed
      if (e.which === 9 || e.which === 16 || e.which === 17) {
        return;
      }
      const value = e.currentTarget.value;
      const id = e.currentTarget.id;
      if (!sesmScripts.validate_input(value, id)) {
        sesmScripts.show_input_error(id);
      } else {
        sesmScripts.remove_input_errors('#input-error-' + id);
      }
    });
    /**
       * On resize
       */
    jQuery(window).resize(() => {
      sesmScripts.move_selection_indicator(0);
      if (sesmScripts.is_mobile()) {
        jQuery('#sesm_sku_input').attr('placeholder', __('Input SKU', 'super-easy-stock-manager'));
      }
    });
  }

  /**
     * Action to start the ajax action.
     * Happens on enter press or on barcode scan success.
     */
  async fire_ajax() {
    const ajaxResult = await sesmScripts.ajax.do_ajax();
    if (!sesmScripts.empty(ajaxResult)) {
      sesmScripts.addToHistory(jQuery.parseJSON(ajaxResult));
    } else {
      console.log('Failed to add to history: ' + ajaxResult);
    }
  }

  /**
     * Callback when a code was found
     *
     * @param {string} code The code
     * @return {void}
     */
  onScanSuccess(code) {
    if (sesmScripts.empty(code)) {
      return false;
    }
    jQuery('#sesm_sku_input').val(code);
    sesmScripts.scanner.clear();
    // Hide and show button
    jQuery('#scan-button').show();
    jQuery('#scan-button-active').hide();
    // Fire the ajax
    sesmScripts.fire_ajax();
    console.log(code);
  }

  /**
     * Callback when a error happened during barcode scanning
     * @param {string} message Error message
     *
     */
  onScanFailure(message) {
    console.log(message);
  }

  /**
     * Slides up the scan container
     */
  show_scan_container() {
    if (jQuery('#mobile-scan-container').css('display') === 'flex') {
      return;
    }
    jQuery('#mobile-scan-container').css('display', 'flex');
    jQuery('#mobile-scan-container').css('bottom', -jQuery('#mobile-scan-container').height());
    jQuery('#mobile-scan-container').animate({'bottom': 0}, 200);
  }

  /**
     * Shows the buttons
     */
  activate_sesm() {
    jQuery('#sesm_buttons').slideDown('fast');
  }

  /**
     * Moves the indicator of the tool below the button
     * @param {int} animationDuration
     * @return {void}
     */
  move_selection_indicator(animationDuration = 200) {
    if (jQuery('#sesm_buttons .button-active').length === 0) {
      return;
    }
    const activePosition = jQuery('#sesm_buttons .button-active')[0].offsetLeft;
    const activeCenter = jQuery('#sesm_buttons .button-active').width() / 2;

    const padding = Number.parseInt(jQuery('#sesm_container').css('padding-left'));
    const finalLeft = activePosition - padding + activeCenter;

    if (jQuery('#selection-indicator')[0].offsetLeft === padding) {
      animationDuration = 0; // Move instantly if not in position yet
      jQuery('#selection-indicator').animate({opacity: 1}, animationDuration);
    }
    jQuery('#selection-indicator').animate({
      left: finalLeft,
    },
    animationDuration);
  }

  /**
     * Adds an Item to the History
     * @param {object} jsonData
     */
  addToHistory(jsonData) {
    let template = this.get_template_by_state(jsonData.template);

    if (this.empty(template)) {
      jQuery('#sesm_history').prepend(__(`Template "${jsonData.template}" not loaded`, 'super-easy-stock-manager'));
    }

    this.set_icon_class(jsonData.template);
    const attr = this.format_attributes(jsonData);
    if (!this.empty(attr)) {
      jsonData.attributes = attr;
    }

    jQuery.each(jsonData, function(key, value) {
      value = sesmScripts.format_value(key, value, jsonData);
      template = template.replaceAll('{{' + key + '}}', value);
    });

    jQuery.each(this.field_names, function(key, value) {
      value = sesmScripts.format_value(key, value);
      template = template.replaceAll('{{' + key + '}}', value);
    });

    jQuery('#sesm_history').addClass('active');
    jQuery('#sesm_history').prepend(template);
    jQuery('#sesm_history article').first().animate({opacity: 1, height: '100%'}, 500);
  }

  /**
     * Loads the template according to the template given. The Template must be loaded first by SesmTemplate.load_default_template()
     * @param {string} template The template. Can be get, error, updateStock or updatePrice
     * @return {string} The template
     */
  get_template_by_state(template) {
    switch (template) {
      case 'error':
        return sesmScripts.template.loaded_templates.error;
      case 'updateStock':
        return sesmScripts.template.loaded_templates.updatestock;
      case 'updatePrice':
        return sesmScripts.template.loaded_templates.updateprice;

      default:
        return sesmScripts.template.loaded_templates.item;
        break;
    }
  }

  /**
     * Gets the fontawesome class name by template name
     *
     * @param {string} template The template. Can be get, error, updateStock or updatePrice
     */
  set_icon_class(template) {
    let classname = '';
    switch (template) {
      case 'get':
        classname = 'fas fa-question';
        break;
      case 'updateStock':
        classname = 'fas fa-box-open';
        break;
      case 'updatePrice':
        classname = 'far fa-money-bill-alt';
        break;
      default:
        break;
    }
    this.field_names.iconclass = classname;
  }

  /**
     * Formats the product attributes
     *
     * @param {object} jsonData The data from the ajax request as object
     * @return {string} The attributes
     */
  format_attributes(jsonData) {
    if (this.empty(jsonData.attributes)) {
      return '';
    }
    return jsonData.attributes.replace(', ', '<br/>');
  }

  /**
     * Filters the data by field name
     * @param {string} fieldName The name of the field form the jsonData
     * @param {string} value The value of the field
     * @param {object} jsonData The whole json data as an object
     * @return {string} The modified string
     */
  format_value(fieldName, value, jsonData) {
    switch (fieldName) {
      case 'stock_quantity':
        const number = parseInt(value);
        return number < 1 ? '<span class=\'red\'>' + number + '</span>' : value;
      case 'regular_price':
        return (!jsonData.sale_price) ? value + ' ' + jsonData.currency : '<span class="strikethrough">' + value + ' ' + jsonData.currency + '</span>';

      case 'weight':
        return value + ' kg';

      case 'sale_price':
        return (!jsonData.sale_price) ? '' : value + ' ' + jsonData.currency;
      case 'manage_stock':
        return (value !== false) ? '' : __('Stock management got activated', 'super-easy-stock-manager');

      case 'to_regular':
        return sesmScripts.format_price_change(jsonData.from_regular, jsonData.to_regular, jsonData, fieldName);
      case 'to_sale':
        return sesmScripts.format_price_change(jsonData.from_sale, jsonData.to_sale, jsonData, fieldName);
      default:
        return value;
    }
  }
  /**
 * Calculate the length of the string to set the font size
 * Also, set smaller font-size on multi-line
 * @param {float} fromPrice The from price
 * @param {float} toPrice The to price
 * @param {object} jsonData The data from the ajax request as an object
 * @param {string} fieldName The name of the field
 * @return {string}
 */
  format_price_change(fromPrice, toPrice, jsonData, fieldName) {
    const priceLength = (jsonData.from_regular + jsonData.to_regular + jsonData.currency).length;
    const priceLengthSale = (jsonData.from_sale + jsonData.to_sale + jsonData.currency).length;
    const priceNotice = (fieldName === 'to_regular') ?jsonData.regular_notice:jsonData.sale_notice;

    if (!sesmScripts.empty(priceNotice)) {
      return '<div class="info-text">' + priceNotice + '</div>';
    }
    // No change
    if (fromPrice === toPrice) {
      return '';
    }
    // Price is empty or undefined
    if (sesmScripts.empty(toPrice)) {
      return '';
    }

    const classLongContent = (priceLength + priceLengthSale > 7 || jsonData.to_sale > 0) ? 'content-long' : '';
    const isSingleRegularClass = (jsonData.to_sale === 0) ? 'single' : '';
    const isSingleSaleClass = (jsonData.to_regular === 0) ? 'single' : '';
    if (fieldName === 'to_regular') {
      return '<div class="' + classLongContent + ' ' +
      isSingleRegularClass + '"><span class="from_price strikethrough">' + fromPrice + ' ' +
      jsonData.currency + '</span><span class="to_price">' + toPrice + ' ' + jsonData.currency + '</span></div>';
    } else {
      return '<div class="' + classLongContent + ' ' +
      isSingleSaleClass + '"><span class="from_price strikethrough">' + fromPrice+ ' ' +
      jsonData.currency + '</span><span class="to_price">' + toPrice + ' ' + jsonData.currency + '</span></div>';
    }
  }

  /**
     * Increases or decreases the quantity
     *
     * @param {bool} add If one should be added or removed
     */
  changeQuantity(add) {
    const quant = (!this.empty(jQuery('#sesm_quant').val())) ? parseInt(jQuery('#sesm_quant').val()) : 0;
    let newQuant = 0;
    if (add === true) {
      newQuant = ((quant + 1) == 0) ? 1 : quant + 1;
    } else {
      newQuant = ((quant - 1) == 0) ? -1 : quant - 1;
    }
    newQuant = (!Number.isInteger(newQuant)) ? 0 : newQuant;
    jQuery('#sesm_quant').val(newQuant);
    jQuery('#sesm_sku_input').focus();
  }

  /**
     * Validate the input. This runs on input change
     *
     * @param {string} value The input value
     * @param {string} type The type or ID of the input
     * @return {bool} True if valid, false if not
     */
  validate_input(value, type) {
    let regex = '';
    const allowEmpty = true;
    switch (type) {
      case 'sesm_quant':
        regex = /^[0-9\.,]{1,}$/g;
        break;
      case 'sesm_price_reg':
      case 'sesm_price_sale':
        regex = /^[0-9\.,]{1,}$/g;
        break;
      default:
        break;
    }

    if (sesmScripts.empty(value)) {
      return (allowEmpty) ? true : false;
    }
    if (!sesmScripts.empty(regex) && regex.exec(value) !== null) {
      return true;
    }
    return false;
  }

  /**
     * Shows the input error tooltip
     * @param {string} id ID of the input field
     * @return {void}
     */
  show_input_error(id) {
    let message = '';
    switch (id) {
      case 'sesm_quant':
        message = __('The Quantity contains invalid characters. Only 0-9, comma (,) and period (.) are allowed', 'super-easy-stock-manager');
        break;
      case 'sesm_price_reg':
      case 'sesm_price_sale':
        message = __('The Price contains invalid characters. Only 0-9, comma (,) and period (.) are allowed', 'super-easy-stock-manager');
        break;

      default:
        break;
    }
    if (sesmScripts.empty(message)) {
      return false;
    }
    const tooltip = sesmScripts.template.apply_template(sesmScripts.template.loaded_templates.errortooltip, {error: message, id: id});
    if (jQuery('#input-error-' + id).length === 0) {
      jQuery('#' + id).before(tooltip);
    }
    return;
  }
  /**
     * Removes all the input error tooltips or the
     */

  /**
     * Removes the tooltip
     * @param {string} item The CSS selector
     */
  remove_input_errors(item = '.input-error-field') {
    jQuery('#sesm_container ' + item).remove();
  }

  // Helper functions
  /**
     * Checks if the given value is empty or null
     * @param {mixed} value
     * @return {bool}
     */
  empty(value) {
    if (value === null) {
      return true;
    }
    if (typeof value === 'undefined') {
      return true;
    }
    if (value.length === 0) {
      return true;
    }
    return false;
  }
}
const {__, _x, _n, _nx} = wp.i18n; // Map the functions to the wp translation script

const sesmScripts = new SesmMain;
sesmScripts.construct();
