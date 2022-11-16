class sesmMain {

    sesm_do = '';

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

            //Add event listeners
            sesm_scripts.add_event_listener();
            sesm_scripts.activate_sesm();
        });
    }

    /**
     * Adds the event listeners
     */
    add_event_listener(){
        jQuery("#sesm_buttons span").click(function () {
            (sesm_scripts.sesm_do = jQuery(this).data("do")),
                jQuery("#sesm_input input").hide(),
                jQuery("#sesm_input label").hide(),
                jQuery("#sesm_input .quant_flex_group").hide(),
                jQuery("#sesm_sku_input").show(),
                jQuery("[for=sesm_sku_input]").show(),
                jQuery("#sesm_sku_input").focus(),
                jQuery(".sesm_input." + sesm_scripts.sesm_do).show(),
                jQuery(".sesm_label." + sesm_scripts.sesm_do).show(),
                jQuery("#sesm_buttons span.current").removeClass("current"),
                jQuery(this).addClass("current");
        });
        jQuery(document).on("keyup", function (s) {
            if(s.which == 13){
                sesm_scripts.ajax.do_ajax();
                jQuery("#sesm_sku_input").val("")
            }
        }),
        jQuery("#add_quant_btn").click(function () {
            changeQuantity(!0);
        }),
        jQuery("#remove_quant_btn").click(function () {
            changeQuantity(!1);
        });
    }
    /**
     * Shows the buttons
     */
    activate_sesm(){
        jQuery('#sesm_buttons').show('slow');
    }

    addToHistory(json_data) {
        var template = sesm_scripts.template.loaded_templates.item;
        if(json_data.template === 'error'){
            json_data.title = __('Error','sesm');
            template = sesm_scripts.template.loaded_templates.error;
        }

        if(this.empty(template)){
            jQuery("#sesm_history").prepend(__(`Template "${json_data.template}" not loaded`,'sesm'));
        }

        jQuery.each(json_data, function (key, value) {
            value = sesm_scripts.colorValues(key, value);
            template = template.replaceAll("{{" + key + "}}", value);
        }),
            jQuery("#sesm_history").addClass("active"),
            jQuery("#sesm_history").prepend(template);
    }

    colorValues(template_name, value) {
        switch (template_name) {
            case "stock_quantity":
            case "regular_price":
            case "sale_price":
                var number = parseInt(value);
                return number < 1 ? "<span class='red'>" + number + "</span>" : value;
            default:
                return value;
        }
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