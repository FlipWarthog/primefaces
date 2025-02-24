/**
 * __PrimeFaces AjaxExceptionHandler Widget__
 *
 * @interface {PrimeFaces.widget.AjaxExceptionHandlerCfg} cfg The configuration for the {@link  AjaxExceptionHandler | AjaxExceptionHandler widget}.
 * You can access this configuration via {@link PrimeFaces.widget.BaseWidget.cfg|BaseWidget.cfg}. Please note that this
 * configuration is usually meant to be read-only and should not be modified.
 * @extends {PrimeFaces.widget.BaseWidgetCfg} cfg
 *
 * @prop {string} cfg.exceptionType The exception type.
 * @prop {string} cfg.update The components to update.
 * @prop {string} cfg.onexception The JS callback.
 */
PrimeFaces.widget.AjaxExceptionHandler = class AjaxExceptionHandler extends PrimeFaces.widget.BaseWidget {

    /**
     * @override
     * @inheritdoc
     * @param {PrimeFaces.PartialWidgetCfg<TCfg>} cfg
     */
    init(cfg) {
        super.init(cfg);
    }

    /**
     * If the widget handles the passed error.
     * @param {string} errorName The error name.
     * @return {boolean} If the widget handles the passed error.
     */
    handles(errorName) {
        // strip off class prefix if existing
        if (errorName.startsWith('class ')) {
            errorName = errorName.replace('class ', '');
        }

        return this.getExceptionType() === errorName;
    }

    /**
     * Handles the passed error.
     * @param {string} errorName The error name.
     * @param {string} errorMessage The error message.
     */
    handle(errorName, errorMessage) {
        var $this = this;

        if (this.cfg.update) {
            var options = {
                source: $this.id,
                process: $this.id,
                update: $this.cfg.update,
                ignoreAutoUpdate: true,
                global: false,
                oncomplete: function(xhr, status, args, data) {
                    if ($this.cfg.onexception) {
                        $this.cfg.onexception.call($this, errorName, errorMessage);
                    }
                }
            };
            PrimeFaces.ajax.Request.handle(options);
        }
        else if (this.cfg.onexception) {
            this.cfg.onexception.call($this, errorName, errorMessage);
        }
    }

    /**
     * Returns the exception type.
     * @return {string} The exception type.
     */
    getExceptionType() {
        return this.cfg.exceptionType;
    }

    /**
     * Returns if the current widget is not registered to a specific exception type.
     * Global exception handlers should be called, if no widget is available for a specific exception type.
     * @return {boolean} if global or not.
     */
    isGlobal() {
        return !this.getExceptionType() ;
    }
};