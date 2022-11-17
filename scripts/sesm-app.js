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

        });
    }

    load_field_names() {
        this.field_names.price_title = __('Price', 'sesm');
        this.field_names.weight_title = __('Weight', 'sesm');
        this.field_names.quantity_title = __('Quantity', 'sesm');
        this.field_names.sku_title = __('SKU', 'sesm');
        this.field_names.iconclass = "";
    }

    /**
     * Adds the event listeners
     */
    add_event_listener() {
        jQuery("#sesm_buttons button").click(function () {
            (sesm_scripts.sesm_do = jQuery(this).data("do")),
                jQuery("#sesm_input input").hide(),
                jQuery("#sesm_input label").hide(),
                jQuery("#sesm_input .quant_flex_group").hide(),
                jQuery("#sesm_sku_input").show(),
                jQuery("[for=sesm_sku_input]").show(),
                jQuery("#sesm_sku_input").focus(),
                jQuery(".sesm_input." + sesm_scripts.sesm_do).show(),
                jQuery(".sesm_label." + sesm_scripts.sesm_do).show(),
                jQuery("#sesm_buttons button.button-active").removeClass("button-active"),
                jQuery(this).addClass("button-active");
        });
        jQuery(document).on("keyup", function (s) {
            if (s.which == 13) {
                sesm_scripts.ajax.do_ajax();
                jQuery("#sesm_sku_input").val("")
            }
        }),
            jQuery("#add_quant_btn").click(function () {
                sesm_scripts.changeQuantity(!0);
            }),
            jQuery("#remove_quant_btn").click(function () {
                sesm_scripts.changeQuantity(!1);
            });
    }
    /**
     * Shows the buttons
     */
    activate_sesm() {
        jQuery('#sesm_buttons').show('slow');
    }

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
    }

    get_template_by_state(state) {
        switch (state) {
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

    format_attributes(json_data) {
        if (this.empty(json_data.attributes)) {
            return "";
        }
        return json_data.attributes.replace(', ', '<br/>');
    }

    format_value(template_name, value, json_data) {
        switch (template_name) {
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
                return (value === 0) ? '' : '<div><span class="from_price strikethrough">' + json_data.from_regular + ' ' + json_data.currency + '</span> <span class="to_price">' + value + ' ' + json_data.currency + '</span></div>';
            case "to_sale":
                return (value === 0) ? '' : '<div><span class="from_price strikethrough">' + json_data.from_sale + ' ' + json_data.currency + '</span> <span class="to_price">' + value + ' ' + json_data.currency + '</span></div>';

            default:
                return value;
        }
    }

    changeQuantity(s) {
        if(this.empty(jQuery("#sesm_quant").val())){
            jQuery("#sesm_quant").val(0);
        }
        var e = parseInt(jQuery("#sesm_quant").val()),
            a = 0;
        (a = !0 === s ? (e + 1 == 0 ? 1 : e + 1) : e - 1 == 0 ? -1 : e - 1), jQuery("#sesm_quant").val(a), jQuery("#sesm_sku_input").focus();
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

/*function changeQuantity(s) {
    var e = parseInt(jQuery("#sesm_quant").val()),
        a = 0;
    (a = !0 === s ? (e + 1 == 0 ? 1 : e + 1) : e - 1 == 0 ? -1 : e - 1), jQuery("#sesm_quant").val(a), jQuery("#sesm_sku_input").focus();
}
function fire() {
    var s = jQuery("#sesm_sku_input").val(),
        e = jQuery("#sesm_quant").val(),
        a = jQuery(".sesm_input.update_price").val(),
        t = jQuery(".sesm_input.update_price.sale").val();
    jQuery("#sesm_sku_input_loader").addClass("active");
    var n = { action: "sesm-ajax", do: sesm_do, sku: s, quantity: e, price: a, price_sale: t };
    $.post(wp_site_url + "/wp-admin/admin-ajax.php", n, function (s) {
        addToHistory($.parseJSON(s)), jQuery("#sesm_sku_input_loader").removeClass("active");
    });
}
function addToHistory(s) {
    var e = historyTemplate[s.template];
    $.each(s, function (s, a) {
        (a = colorValues(s, a)), (e = e.replaceAll("${" + s + "}", a));
    }),
        jQuery("#sesm_history").addClass("active"),
        jQuery("#sesm_history").prepend(e);
}
function colorValues(s, e) {
    switch (s) {
        case "stock_quantity":
        case "regular_price":
        case "sale_price":
            var a = parseInt(e);
            return a < 1 ? "<span class='red'>" + a + "</span>" : e;
        default:
            return e;
    }
}
import * as tools from "./modules/tools.js";
var sesm_do = "";
jQuery(document).ready(function () {
    jQuery("#sesm_buttons span").click(function () {
        (sesm_do = jQuery(this).data("do")),
            jQuery("#sesm_input input").hide(),
            jQuery("#sesm_input label").hide(),
            jQuery("#sesm_input .quant_flex_group").hide(),
            jQuery("#sesm_sku_input").show(),
            jQuery("[for=sesm_sku_input]").show(),
            jQuery("#sesm_sku_input").focus(),
            jQuery(".sesm_input." + sesm_do).show(),
            jQuery(".sesm_label." + sesm_do).show(),
            jQuery("#sesm_buttons span.current").removeClass("current"),
            jQuery(this).addClass("current");
    });
}),
    jQuery(document).on("keyup", function (s) {
        13 == s.which && (sesmAjax(), jQuery("#sesm_sku_input").val(""));
    }),
    jQuery("#add_quant_btn").click(function () {
        changeQuantity(!0);
    }),
    jQuery("#remove_quant_btn").click(function () {
        changeQuantity(!1);
    });
*/