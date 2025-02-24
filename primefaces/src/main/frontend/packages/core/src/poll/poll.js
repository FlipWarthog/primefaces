/**
 * __PrimeFaces Poll Widget__
 * 
 * Poll is an ajax component that has the ability to send periodical ajax requests.
 * 
 * @typedef {"millisecond" | "second"} PrimeFaces.widget.Poll.IntervalType Time unit for the polling interval.
 * 
 * @typedef {() => void} PrimeFaces.widget.Poll.PollingAction Callback that performs the polling action. See also
 * {@link PollCfg.fn}.
 * 
 * @prop {boolean} active Whether polling is currently active.
 * @prop {number} timer The set-interval timer ID of the timer used for polling.
 * 
 * @interface {PrimeFaces.widget.PollCfg} cfg The configuration for the {@link  Poll| Poll widget}.
 * You can access this configuration via {@link PrimeFaces.widget.BaseWidget.cfg|BaseWidget.cfg}. Please note that this
 * configuration is usually meant to be read-only and should not be modified.
 * @extends {PrimeFaces.widget.BaseWidgetCfg} cfg
 * 
 * @prop {boolean} cfg.autoStart In auto start mode, polling starts automatically on page load. To start polling on
 * demand set to false.
 * @prop {PrimeFaces.widget.Poll.IntervalType} cfg.intervalType Time unit for the frequency.
 * @prop {number} cfg.frequency Duration between two successive AJAX poll request, either in milliseconds or seconds,
 * depending on the configure `intervalType`.
 * @prop {PrimeFaces.widget.Poll.PollingAction} cfg.fn Callback that performs the polling action.
 */
PrimeFaces.widget.Poll = class Poll extends PrimeFaces.widget.BaseWidget {

    /**
     * @override
     * @inheritdoc
     * @param {PrimeFaces.PartialWidgetCfg<TCfg>} cfg
     */
    init(cfg) {
        super.init(cfg);

        this.active = false;

        if (this.cfg.autoStart) {
            this.start();
        }
    }

    /**
     * @override
     * @inheritdoc
     * @param {PrimeFaces.PartialWidgetCfg<TCfg>} cfg
     */
    refresh(cfg) {
        this.stop();

        super.refresh(cfg);
    }

    /**
     * @override
     * @inheritdoc
     */
    destroy() {
        super.destroy();

        this.stop();
    }

    /**
     * Starts the polling, sending AJAX requests in periodic intervals.
     * @return {boolean} `true` if polling was started, or `false` otherwise.
     */
    start() {
        if (!this.active) {
            //Call user onactivated callback and block if they return false
            if (this.cfg.onActivated && this.cfg.onActivated.call(this) === false) {
                return false;
            }

            var frequency = this.cfg.intervalType == 'millisecond' ? this.cfg.frequency : (this.cfg.frequency * 1000);
            this.timer = setInterval(this.cfg.fn, frequency);
            this.active = true;
        }
        return true;
    }

    /**
     * Stops the polling so that no more AJAX requests are made.
     * @return {boolean} `true` if polling wsa stopped, or `false` otherwise.
     */
    stop() {
        if (this.active) {
            //Call user ondeactivated callback and block if they return false
            if (this.cfg.onDeactivated && this.cfg.onDeactivated.call(this) === false) {
                return false;
            }

            clearInterval(this.timer);
            this.active = false;
        }
        return true;
    }

    /**
     * Checks whether polling is active or whether it was stopped.
     * @return {boolean} `true` if polling is currently active, or `false` otherwise.
     */
    isActive() {
        return this.active;
    }
}