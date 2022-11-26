class sesmMain {

    sesm_do = '';
    field_names = {};
    scanner = {};

    construct() {
        jQuery(document).ready(async function () {
            //Import the ajax and template handler
            await import('./modules/ajax.js').then((module) => {
                sesm_scripts.ajax = new module.SesmAjax;
            });
            await import('./modules/template.js').then((module) => {
                sesm_scripts.template = new module.SesmTemplate;
            });



            //Load the templates
            await sesm_scripts.template.load_default_templates();

            //Add the default field names
            sesm_scripts.load_field_names();

            //Add event listeners
            sesm_scripts.add_event_listener();
            sesm_scripts.activate_sesm();

            sesm_scripts.is_mobile();

        });
    }

    load_field_names() {
        this.field_names.price_title = __('Price', 'super-easy-stock-manager');
        this.field_names.weight_title = __('Weight', 'super-easy-stock-manager');
        this.field_names.quantity_title = __('Quantity', 'super-easy-stock-manager');
        this.field_names.sku_title = __('SKU', 'super-easy-stock-manager');
        this.field_names.iconclass = "";
    }
    /**
     * Checks if the device is a mobile device or not.
     * @returns true if mobile, otherwise false
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
        jQuery("#sesm_buttons button").click(function () {
            sesm_scripts.sesm_do = jQuery(this).data("do");

            //reset all
            jQuery("#sesm_input .quant_flex_group").hide();
            jQuery("#sesm_input .price_flex_group").hide();
            jQuery("#sesm_buttons button.button-active").removeClass("button-active");

            //Show the fields again, focus and set class
            jQuery("#sesm_sku_input").slideDown('fast');
            jQuery("#sesm_container #selection-indicator").slideDown('fast');
            jQuery(this).addClass("button-active");

            //Auto focus if device is a mobile device. 
            //@todo: Add option to enable or disable autofocus 
            if (sesm_scripts.is_mobile()) {
                //Is mobile
                sesm_scripts.show_scan_container();
            } else {
                jQuery("#sesm_sku_input").focus();
            }

            sesm_scripts.move_selection_indicator();

            switch (sesm_scripts.sesm_do) {
                case "add_quantities":
                    jQuery(".sesm_options .quant_flex_group").slideDown('fast');
                    break;
                case "update_price":
                    jQuery(".sesm_options .price_flex_group").slideDown('fast');
                    break;
                case "get_product":
                    break;
            }

        });

        jQuery('#scan-button').click(() => {

            //Hide and show button
            jQuery('#scan-button').hide();
            jQuery('#scan-button-active').show();

            //Open scan application
            sesm_scripts.scanner = new Html5QrcodeScanner(
                "scanner-container",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    useBarCodeDetectorIfSupported: true,
                    rememberLastUsedCamera: true,
                    showTorchButtonIfSupported: true,
                    defaultZoomValueIfSupported: 2
                });

            sesm_scripts.scanner.render(sesm_scripts.onScanSuccess, sesm_scripts.onScanFailure);

        });

        jQuery('#scan-button-active').click(() => {

            //Hide and show button
            jQuery('#scan-button').show();
            jQuery('#scan-button-active').hide();

            sesm_scripts.scanner.clear();

        });

        jQuery(document).on("keyup", async function (s) {
            if (s.which == 13) {
                sesm_scripts.fire_ajax();
            }
        }),
            jQuery("#add_quant_btn").click(function () {
                sesm_scripts.changeQuantity(true);
            }),
            jQuery("#remove_quant_btn").click(function () {
                sesm_scripts.changeQuantity(false);
            });

        /**
         * On value change, validate the input
         */
        jQuery('#sesm_container input').keyup((e) => {
            const value = e.currentTarget.value;
            const id = e.currentTarget.id;
            if (!sesm_scripts.validate_input(value, id)) {
                sesm_scripts.show_input_error(id);
            } else {
                sesm_scripts.remove_input_errors('#input-error-' + id);
            }
        });
        /**
         * On resize
         */
        jQuery(window).resize(() => {
            sesm_scripts.move_selection_indicator(0);
            if (sesm_scripts.is_mobile()) {
                jQuery("#sesm_sku_input").attr('placeholder', __('Input SKU', 'super-easy-stock-manager'));
            }
        });
    }

    /**
     * Action to start the ajax action.
     * Happens on enter press or on barcode scan success.
     */
    async fire_ajax() {
        const ajax_result = await sesm_scripts.ajax.do_ajax();
        if (!sesm_scripts.empty(ajax_result)) {
            sesm_scripts.addToHistory(jQuery.parseJSON(ajax_result));
        } else {
            console.log('Failed to add to history: ' + ajax_result);
        }
    }

    /**
     * Callback when a code was found
     * 
     * @param {string} code The code
     * @returns void
     */
    onScanSuccess(code) {
        if (sesm_scripts.empty(code)) {
            return false;
        }
        jQuery('#sesm_sku_input').val(code);
        sesm_scripts.scanner.clear();
        //Hide and show button
        jQuery('#scan-button').show();
        jQuery('#scan-button-active').hide();
        //Fire the ajax 
        sesm_scripts.fire_ajax();
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
        if (jQuery("#mobile-scan-container").css('display') === 'flex') {
            return;
        }
        jQuery("#mobile-scan-container").css('display', 'flex');
        jQuery("#mobile-scan-container").css('bottom', -jQuery("#mobile-scan-container").height());
        jQuery("#mobile-scan-container").animate({ 'bottom': 0 }, 200);
    }

    /**
     * Shows the buttons
     */
    activate_sesm() {
        jQuery('#sesm_buttons').slideDown('slow');
    }

    /**
     * Moves the indicator of the tool below the button
     */
    move_selection_indicator(animation_duration = 200) {
        if (jQuery('#sesm_buttons .button-active').length === 0) {
            return;
        }
        const active_position = jQuery('#sesm_buttons .button-active')[0].offsetLeft;
        const active_center = jQuery('#sesm_buttons .button-active').width() / 2;

        const padding = Number.parseInt(jQuery('#sesm_container').css('padding-left'));
        const final_left = active_position - padding + active_center;

        if (jQuery('#selection-indicator')[0].offsetLeft === padding) {
            animation_duration = 0; //Move instantly if not in position yet
            jQuery('#selection-indicator').animate({ opacity: 1 }, animation_duration);
        }
        jQuery('#selection-indicator').animate({
            left: final_left,
        },
            animation_duration);
    }

    /**
     * Adds an Item to the History
     * @param {} json_data 
     */
    addToHistory(json_data) {
        var template = this.get_template_by_state(json_data.template);

        if (this.empty(template)) {
            jQuery("#sesm_history").prepend(__(`Template "${json_data.template}" not loaded`, 'super-easy-stock-manager'));
        }

        this.set_icon_class(json_data.template);
        const attr = this.format_attributes(json_data)
        if (!this.empty(attr)) {
            json_data.attributes = attr;
        }

        jQuery.each(json_data, function (key, value) {
            value = sesm_scripts.format_value(key, value, json_data);
            template = template.replaceAll("{{" + key + "}}", value);
        });

        jQuery.each(this.field_names, function (key, value) {
            value = sesm_scripts.format_value(key, value);
            template = template.replaceAll("{{" + key + "}}", value);
        });

        jQuery("#sesm_history").addClass("active");
        jQuery("#sesm_history").prepend(template);
        jQuery("#sesm_history article").first().animate({ opacity: 1, height: "100%" }, 500);
    }

    /**
     * Loads the template according to the template given. The Template must be loaded first by SesmTemplate.load_default_template()
     * @param {string} template The template. Can be get, error, updateStock or updatePrice
     * @returns The template
     */
    get_template_by_state(template) {
        switch (template) {
            case 'error':
                return sesm_scripts.template.loaded_templates.error;
            case 'updateStock':
                return sesm_scripts.template.loaded_templates.updatestock;
            case 'updatePrice':
                return sesm_scripts.template.loaded_templates.updateprice;

            default:
                return sesm_scripts.template.loaded_templates.item;
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
                classname = "fas fa-question"
                break;
            case 'updateStock':
                classname = "fas fa-box-open"
                break;
            case 'updatePrice':
                classname = "far fa-money-bill-alt"
                break;
            default:
                break;
        }
        this.field_names.iconclass = classname;
    }

    /**
     * Formats the product attributes
     * 
     * @param {object} json_data The data from the ajax request as object
     * @returns {string} The attributes
     */
    format_attributes(json_data) {
        if (this.empty(json_data.attributes)) {
            return "";
        }
        return json_data.attributes.replace(', ', '<br/>');
    }

    /**
     * Filters the data by field name
     * @param {string} field_name The name of the field form the json_data
     * @param {string} value The value of the field
     * @param {object} json_data The whole json data as an object
     * @returns {string} The modified string
     */

    format_value(field_name, value, json_data) {

        if (field_name === 'to_regular' || field_name === 'to_sale') {
            var price_length = (json_data.from_regular + json_data.to_regular + json_data.currency).length;
            var price_length_sale = (json_data.from_sale + json_data.to_sale + json_data.currency).length;
        }
        switch (field_name) {
            case "stock_quantity":
                var number = parseInt(value);
                return number < 1 ? "<span class='red'>" + number + "</span>" : value;
            case "regular_price":
                return (!json_data.sale_price) ? value + ' ' + json_data.currency : '<span class="strikethrough">' + value + ' ' + json_data.currency + '</span>';

            case "weight":
                return value + ' kg';

            case "sale_price":
                return (!json_data.sale_price) ? "" : value + ' ' + json_data.currency;
            case "manage_stock":
                return (value !== false) ? '' : __('Stock management got activated', 'super-easy-stock-manager');

            case "to_regular":
                //Calculate the length of the string to set the font size
                //Also, set smaller font-size on multi-line
                const class_long_content = (price_length + price_length_sale > 7 || json_data.to_sale > 0) ? 'content-long' : '';
                const is_single_regular_class = (json_data.to_sale === 0) ? 'single' : '';
                return (value === 0) ? '' : '<div class="' + class_long_content + ' ' + is_single_regular_class + '"><span class="from_price strikethrough">' + json_data.from_regular + ' ' + json_data.currency + '</span><span class="to_price">' + value + ' ' + json_data.currency + '</span></div>';
            case "to_sale":
                const class_long_content_sale = (price_length + price_length_sale > 7 || json_data.to_regular > 0) ? 'content-long' : '';
                const is_single_sale_class = (json_data.to_regular === 0) ? 'single' : '';
                return (value === 0) ? '' : '<div class="' + class_long_content_sale + ' ' + is_single_sale_class + '"><span class="from_price strikethrough">' + json_data.from_sale + ' ' + json_data.currency + '</span><span class="to_price">' + value + ' ' + json_data.currency + '</span></div>';

            default:
                return value;
        }
    }

    /**
     * Increases or decreases the quantity
     * 
     * @param {bool} add If one should be added or removed
     */
    changeQuantity(add) {
        var quant = (!this.empty(jQuery('#sesm_quant').val())) ? parseInt(jQuery('#sesm_quant').val()) : 0;
        var newQuant = 0;
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
     * @returns {bool} True if valid, false if not
     */
    validate_input(value, type) {
        let regex = '';
        let allow_empty = true;
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

        if (sesm_scripts.empty(regex)) {
            return (allow_empty) ? true : false;
        }
        if (regex.exec(value) !== null) {
            return true;
        }
        return false;
    }

    /**
     * Shows the input error tooltip
     * @param {string} id ID of the input field
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
        if (sesm_scripts.empty(message)) {
            return false;
        }
        const tooltip = sesm_scripts.template.apply_template(sesm_scripts.template.loaded_templates.errortooltip, { error: message, id: id });
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

    //Helper functions
    /**
     * Checks if the given value is empty or null
     * @param {mixed} value 
     * @returns 
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
const { __, _x, _n, _nx } = wp.i18n; //Map the functions to the wp translation script 

let sesm_scripts = new sesmMain;
sesm_scripts.construct();