=== Super Easy Stock Manager ===
Contributors: dansart
Contributors URL: <http://dev.dans-art.ch>
Donate link: https://paypal.me/dansart13
Tags: woocommerce, stock, management, manager, price, quantity, info
Requires at least: 5.5.3
Tested up to: 6.1.1
Requires PHP: 7.4
Stable tag: 1.3.4
WC requires at least: 4.7.0
WC tested up to: 7.1.0
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

This plugin makes managing your products as easy as possible.

== Description ==
A Stock Manager that is built for speed and super easy to use!
Just select the quantity to add or remove, or the price to set, scan the product's barcode, and you are good to go!
This plugin is designed to be used with a barcode scanner on a desktop. On mobile, there is a mobile scan functionality available.

Required Plugins: WooCommerce 7.1.0 or higher

If you like the Plugin, please leave some Stars or spent me a coffee. Thanks!

== Installation ==
1. Upload the plugin files to the /wp-content/plugins/super-easy-stock-manager directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the ‚Plugins‘ screen in WordPress.
3. Use the shortcode [sesm] on any page you like
4. Enjoy


== Screenshots ==
1. The get product screen. A single input field to search for a product. Below, are the three types of WooCommerce products
2. The update-stock screen. With the + and - buttons, or by keyboard, you can set the desired amount to add or remove and scan the SKU to confirm the change
3. the update-price screen. You can set the regular as well as the sale price.
4. The get product screen on a smartphone. With the camera button at the bottom you can use the internal camera as a scanner.
5. The get product screen on a smartphone with the scan app open.

== Upgrade Notice ==
Upload the plugin files to the /wp-content/plugins/super-easy-stock-manager directory, or update the plugin through the WordPress plugins screen directly.

== Frequently Asked Questions ==
Are other shop systems than WooCommerce supported?
- Currently no.

Can I style the frontend?
- Sure, just override the existing CSS with rules in your theme stylesheet

Does it work with the Product ID as well?
- No, it is intended to be used with SKU only.

How do I generate barcodes?
- You can use a plugin like "Barcode Printing for WooCommerce" to print the barcode


== Changelog ==
= [1.3.4] 2022-11-29 =
- Fixed: Cached product price was not updated
- Added 2 new language strings
- Style adjustments

= [1.3.3] 2022-11-29 =
- Readme and Header information updated

= [1.3.2] 2022-11-26 =
- Added: Improved security and input validation
- Changed textdomain to super-easy-stock-manager
- Added 3 new language strings
- Removed old code and templates
- Added tooltip error if invalid characters are given
- Updated Tested up to
- Added style for the tooltip

= [1.3.1] 2022-11-23 =
- Added: Check to make sure WooCommerce is installed

= [1.3] 2022-11-23 =
- Style fixes
- Added Mobile QR/Barcode scanner
- Cleaned code
- Various small improvements

= [1.2] 2022-11-22 =
- Style fixes. Added support for various themes
- Added checks for the input value
- Removed old code