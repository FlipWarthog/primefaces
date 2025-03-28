/**
 * __PrimeFaces ToggleSwitch Widget__
 *
 * ToggleSwitch is used to select a boolean value.
 *
 * > ToggleSwitch is designed to replace the old {@link InputSwitch|InputSwitch component}.
 *
 * @prop {JQuery} input The DOM element for the hidden input field storing the value of this switch.
 * @prop {JQuery} slider The DOM element for the slider.
 * @prop {JQuery} handler The DOM element for the handler.
 *
 * @interface {PrimeFaces.widget.ToggleSwitchCfg} cfg The configuration for the {@link  ToggleSwitch| ToggleSwitch widget}.
 * You can access this configuration via {@link PrimeFaces.widget.BaseWidget.cfg|BaseWidget.cfg}. Please note that this
 * configuration is usually meant to be read-only and should not be modified.
 * @extends {PrimeFaces.widget.BaseWidgetCfg} cfg
 */
PrimeFaces.widget.ToggleSwitch = class ToggleSwitch extends PrimeFaces.widget.BaseWidget {

    /**
     * @override
     * @inheritdoc
     * @param {PrimeFaces.PartialWidgetCfg<TCfg>} cfg
     */
    init(cfg) {
        super.init(cfg);

        this.slider = this.jq.children('.ui-toggleswitch-slider');
        this.handler = this.slider.children('.ui-toggleswitch-handler');
        this.input = $(this.jqId + '_input');

        if(!this.input.is(':disabled')) {
            this._bindEvents();
        }
        
         if(this.input.attr('aria-checked') === "true" || this.input.prop('checked')) {
            this.input.attr('aria-label', this.getAriaLabel('switch.ON'));
        }
        else {
            this.input.attr('aria-label', this.getAriaLabel('switch.OFF'));
        }

        //pfs metadata
        this.input.data(PrimeFaces.CLIENT_ID_DATA, this.id);
    }

    /**
     * Sets up all event listeners that are required by this widget.
     * @private
     */
    _bindEvents() {
        var $this = this;

        this.slider.off('click.toggleSwitch').on('click.toggleSwitch', function(e) {
            $this.input.trigger('click').trigger('focus.toggleSwitch');
        });

        this.input.off('focus.toggleSwitch').on('focus.toggleSwitch', function(e) {
            $this.jq.addClass('ui-toggleswitch-focus');
        })
        .off('blur.toggleSwitch').on('blur.toggleSwitch', function(e) {
            $this.jq.removeClass('ui-toggleswitch-focus');
        })
        .off('keydown.toggleSwitch').on('keydown.toggleSwitch', function(e) {
            if(e.key === ' ') {
                e.preventDefault();
            }
        })
        .off('keyup.toggleSwitch').on('keyup.toggleSwitch', function(e) {
            if(e.key === ' ') {
                $this.toggle();

                e.preventDefault();
            }
        })
        .off('change.toggleSwitch').on('change.toggleSwitch', function(e) {
            if($this.isChecked()) {
                $this.check(true);
            }
            else {
                $this.uncheck(true);
            }
        });
    }

    /**
     * Checks whether this checkbox is currently checked.
     * @return {boolean} `true` if this checkbox is checked, or `false` otherwise.
     */
    isChecked() {
        return this.input.prop('checked');
    }

    /**
     * Turns this switch in case it is off, or turns of off in case it is on.
     */
    toggle() {
        if(this.isChecked())
            this.uncheck();
        else
            this.check();
    }

    /**
     * Turns this switch on if it is not already turned on.
     * @param {boolean} [silent] `true` to suppress triggering event listeners, or `false` otherwise.
     */
    check(silent) {
        this.input.prop('checked', true).attr('aria-checked', true).attr('aria-label', this.getAriaLabel('switch.ON'));
        if (!silent) {
            this.input.trigger('change');
        }
        this.jq.addClass('ui-toggleswitch-checked');
    }

    /**
     * Turns this switch off if it is not already turned of.
     * @param {boolean} [silent] `true` to suppress triggering event listeners, or `false` otherwise.
     */
    uncheck(silent) {
        this.input.prop('checked', false).attr('aria-checked', false).attr('aria-label', this.getAriaLabel('switch.OFF'));
        if (!silent) {
            this.input.trigger('change');
        }
        this.jq.removeClass('ui-toggleswitch-checked');
    }

    /**
     * Disables this input so that the user cannot enter a value anymore.
     */
    disable() {
        PrimeFaces.utils.disableInputWidget(this.jq, this.input);
    }

    /**
     * Enables this input so that the user can enter a value.
     */
    enable() {
        PrimeFaces.utils.enableInputWidget(this.jq, this.input);
    }
}
