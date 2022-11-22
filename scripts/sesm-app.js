class sesmMain {

    sesm_do = '';
    field_names = {};

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
        this.field_names.price_title = __('Price', 'sesm');
        this.field_names.weight_title = __('Weight', 'sesm');
        this.field_names.quantity_title = __('Quantity', 'sesm');
        this.field_names.sku_title = __('SKU', 'sesm');
        this.field_names.iconclass = "";
    }

    is_mobile() {
        if (jQuery(window).width() > 500) {
            return false;
        }
        jQuery("#sesm_sku_input").attr('placeholder', __('Input SKU', 'sesm'));
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
            jQuery("#sesm_sku_input").focus();
            jQuery(this).addClass("button-active");

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
        jQuery(document).on("keyup", async function (s) {
            if (s.which == 13) {
                const ajax_result = await sesm_scripts.ajax.do_ajax();
                if(!sesm_scripts.empty(ajax_result)){
                    sesm_scripts.addToHistory(jQuery.parseJSON(ajax_result));
                }else{
                    console.log('Failed to add to history: '+ ajax_result);
                }
            }
        }),
            jQuery("#add_quant_btn").click(function () {
                sesm_scripts.changeQuantity(true);
            }),
            jQuery("#remove_quant_btn").click(function () {
                sesm_scripts.changeQuantity(false);
            });

        /**
         * On resize
         */
        jQuery(window).resize(() => {
            sesm_scripts.move_selection_indicator(0);
            sesm_scripts.is_mobile();
        });
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
        const active_position = jQuery('#sesm_buttons .button-active').offset().left;
        const active_position_top = jQuery('#sesm_buttons .button-active').offset().top;
        if (jQuery('#selection-indicator').offset().top === 0) {
            animation_duration = 0; //Move instantly if not in position yet
        }
        jQuery('#selection-indicator').animate({
            left: active_position + (jQuery('#sesm_buttons .button-active').width() / 2),
            top: active_position_top + (jQuery('#sesm_buttons .button-active').height() + 2),
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
            jQuery("#sesm_history").prepend(__(`Template "${json_data.template}" not loaded`, 'sesm'));
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
                return (value !== false) ? '' : __('Stock management got activated', 'sesm');

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