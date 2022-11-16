/**
 * Module to handle the ajax actions
 * 
 */
 class SesmTemplate {

    loaded_templates = {};

    async load_default_templates(){
        this.load_template('item','item.html','templates/frontend/');
        this.load_template('error','error.html','templates/frontend/');
    }

      /**
     * Loads a template to the class. Is also called by the get_template method.
     * @param {string} template_id - The ID of the template. Must be unique, otherwise one template can override the other
     * @param {string} file_name - The File name of the template with extension
     * @param {string} path - The path the template is saved in
     * @returns bool
     */
       async load_template(template_id, file_name, path) {
        try {
            const loaded_content = await this.get_template(template_id, file_name, path).then(function (content) {
                return content;
            });
            this.loaded_templates[template_id] = loaded_content;
        } catch (error) {
            console.error('failed to load template: '+file_name);
            console.error(error);
        }
        return false;
    }

    /**
     * Loads a template file. If the template is already loaded, it will use the one from the get this.loaded_templates object, if loaded
     * @param {string} template_id - The ID of the template. Must be unique, otherwise one template can override the other
     * @param {string} file_name - The File name of the template with extension
     * @param {string} path - The path the template is saved in
     * @returns bool
     */
    async get_template(template_id, file, subfolder = '') {
        if (!sesm_scripts.empty(this.loaded_templates[template_id])) {
            return this.loaded_templates[template_id];
        }
        var response = await jQuery.get(
            window.sesm_plugin_root + subfolder + file,
            function (data, textStatus, jqxhr) {
                return data;
            }
        );
        this.loaded_templates[template_id] = response;
        return response;
    }
}
export { SesmTemplate };