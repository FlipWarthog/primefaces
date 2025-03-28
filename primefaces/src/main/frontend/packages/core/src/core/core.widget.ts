import { core } from "./core.js";
import { utils } from "./core.utils.js";

/**
 * The configuration for the {@link BaseWidget | BaseWidget widget}.
 * You can access this configuration via {@link PrimeFaces.widget.BaseWidget.cfg | BaseWidget.cfg}. Please note that this
 * configuration is usually meant to be read-only and should not be modified. This configuration is
 * always accessible via the `cfg` property of a widget and consists of key-value pairs. Please note that, in order
 * to save bandwidth, the server only sends a value for a given configuration key when the value differs from the
 * default value. That is, you must expect any configuration value to be absent and make sure you check for its
 * presence before accessing it.
 */
export interface BaseWidgetCfg {
    /**
     * A map with all behaviors that
     * were defined for this widget. The key is the name of the behavior, the value is the callback function that is
     * invoked when the behavior is called.
     */
    behaviors: Record<string, PrimeType.widget.Behavior>;

    /**
     * `true` to block scrolling when a certain condition is satisfied, or `false` otherwise.
     */
    blockScroll: boolean;

    /**
     * Whether the widget was disabled on the server-side, usually via the `disabled` attribute on the Faces component.
     */
    disabled: boolean;

    /**
     * Whether the widget should be disabled during AJAX postback requests.
     * E.g. a button could get disabled so that it cannot be pressed
     * again until the request finishes. (Since requests need to be
     * queued as mandated by the Faces spec, the user would have to wait
     * anyway.)
     */
    disableOnAjax: boolean;

    /**
     * False to re-enable after disabled by an AJAX event.
     */
    disabledAttr: boolean;

    /**
     * ID of the form to use for AJAX requests.
     */
    formId: string;

    /**
     * The client-side ID of the widget, with all parent naming containers, such as
     * `myForm:myWidget`. This is also the ID of the container HTML element for this widget. In case the widget needs
     * multiple container elements (such as {@link Paginator}), this may also be an array if IDs.
     */
    id: string | string[];

    /**
     * Optional reference to an iframe, e.g. the iframe inside which to
     * place the widget.
     */
    iframe: JQuery<HTMLIFrameElement>;

    /**
     * List of localized labels for the widget. Labels are normally rendered server-side. This property is set by the
     * server when e.g. the client needs to change the label dynamically. The key is the ID of the label, the value the
     * localized label text.
     */
    labels: {
        aria: Record<string, string>;
        [key: string]: string | Record<string, string>;
    };

    /**
     * An optional callback that is invoked
     * before the widget is created, at the start of the {@link BaseWidget.init | init} method. This is
     * usually specified via the `widgetPreConstruct` attribute on the Faces component. Note that this is also called
     * during a `refresh` (AJAX update).
     */
    preConstruct: PrimeType.widget.PreConstructCallback;

    /**
     * An optional callback that is invoked
     * after this widget was created successfully, at the end of the {@link BaseWidget.init | init} method. This is
     * usually specified via the `widgetPostConstruct` attribute on the Faces component. Note that this is also called
     * during a `refresh` (AJAX update).
     */
    postConstruct: PrimeType.widget.PostConstructCallback;

    /**
     * An optional callback that is invoked after
     * this widget was refreshed after an AJAX update, at the end of the {@link BaseWidget.refresh | refresh} method.
     * This is usually specified via the `widgetPostRefresh` attribute on the Faces component.
     */
    postRefresh: PrimeType.widget.PostRefreshCallback;

    /**
     * An optional callback that is invoked before
     * this widget is about to be destroyed, e.g., when the component was removed at the end of an AJAX update. This is
     * called at the beginning of the {@link BaseWidget.destroy | destroy} method. This is usually specified via the
     * `widgetPreDestroy` attribute on the Faces component.
     */
    preDestroy: PrimeType.widget.PreDestroyCallback;

    /**
     * Whether the widget supports touch devices (usually via pointer events etc.).
     */
    touchable: boolean;

    /**
     * The name of the widget variables of this widget. The widget variable can be used to
     * access a widget instance by calling `PF("myWidgetVar")`.
     */
    widgetVar: string;
}

/**
 * The configuration for the {@link DynamicOverlayWidget}.
 * 
 * You can access this configuration via {@link BaseWidget.cfg}. Please note
 * that this configuration is usually meant to be read-only and should not be
 * modified.
 */
export interface DynamicOverlayWidgetCfg extends BaseWidgetCfg, PrimeType.widget.DynamicOverlayFeatureWidgetCfg {
}

/**
 * The configuration for the {@link DeferredWidget}.
 * 
 * You can access this configuration via {@link BaseWidget.cfg}. Please note
 * that this configuration is usually meant to be read-only and should not be
 * modified.
 */
export interface DeferredWidgetCfg extends BaseWidgetCfg {
}

/**
 * __PrimeFaces Base Widget__
 *
 * BaseWidget for the PrimeFaces widgets framework.
 *
 * It provides some common functionality for other widgets. All widgets should inherit from this class, or an
 * appropriate subclass in the following manner:
 *
 * ```js
 * class MyWidget extends PrimeFaces.widget.BaseWidget {
 *
 *   init(cfg) {
 *     super.init(cfg);
 *     // custom initialization
 *   }
 *
 *   // more methods required by your widget
 * }
 * ```
 *
 * If your widget needs to be visible before it can be rendered, consider using the {@link DeferredWidget} as a
 * base class instead.
 *
 * @typeParam Cfg Type of the configuration object for this widget.
 *
 * @prop {string} key The key of the JSON object.
 */
export class BaseWidget<Cfg extends BaseWidgetCfg = BaseWidgetCfg> {
    /**
     * Number of concurrent active Ajax requests.
     */
    ajaxCount: number = 0;

    /**
     * Keeps track of when the AJAX request started.
     */
    ajaxStart: number | null = null;

    /**
     * The configuration of this widget instance. Please note that
     * no property is guaranteed to be present, you should always check for `undefined` before accessing a property.
     * This is partly because the value of a property is not transmitted from the server to the client when it equals
     * the default.
     */
    cfg: PrimeType.widget.PartialWidgetCfg<Cfg> = { id: "", widgetVar: "" } as PrimeType.widget.PartialWidgetCfg<Cfg>;

    /**
     * Array of registered listeners invoked when this widget is destroyed. You should normally not use modify this
     * directly, use {@link addDestroyListener} instead.
     */
    // Need to use any as the type parameter as TypeScript does not have existential types / wildcards (DestroyListener<?>)
    destroyListeners: PrimeType.widget.DestroyListener<any>[] = [];

    /**
     * The client-side ID of this widget, with all parent naming containers, such as
     * `myForm:myWidget`. This is also the ID of the container HTML element for this widget. In case the widget needs
     * multiple container elements (such as `Paginator`), this may also be an array if IDs.
     */
    id: string | string[] = "";

    /**
     * The jQuery instance of the container element of this widget. In case {@link id} is an array, it
     * will contain multiple elements. Please note that some widgets have got not DOM elements at all, in this case this
     * will be an empty jQuery instance.
     */
    jq: JQuery = $();

    /**
     * A CSS selector for the container element (or elements, in case {@link id} is an array) of
     * this widget, This is usually an ID selector (that is properly escaped). You can select the container element or
     * elements like this: `$(widget.jqId)`.
     */
    jqId: string = "";

    /**
     * refreshListeners Array of registered listeners invoked when this widget is refreshed. You should normally not use
     * modify this directly, use {@link addRefreshListener} instead.
     */
    // Need to use any as the type parameter as TypeScript does not have existential types / wildcards (RefreshListener<?>)
    refreshListeners: PrimeType.widget.RefreshListener<any>[] = [];

    /**
     * The name of the widget variables of this widget. The widget variable can be used to
     * access a widget instance by calling `PF('myWidgetVar')`.
     */
    widgetVar: string = "";

    /**
     * Creates a new instance of this widget. Please note that you should __NOT__ override this constructor.
     * Instead, override the {@link init} method, which is called by the framework once the widget instance was
     * created.
     * 
     * In addition, the `init` method is also called when the page is refreshed via AJAX. In that case, the
     * widget instance is reused, and only its `init` method gets called again.
     */
    constructor() { }

    /**
     * A widget class should not declare an explicit constructor, the default constructor provided by this base
     * widget should be used. Instead, override this initialize method which is called after the widget instance
     * was constructed. You can use this method to perform any initialization that is required. For widgets that
     * need to create custom HTML on the client-side this is also the place where you should call your render
     * method.
     *
     * Please make sure to call the super method first before adding your own custom logic to the init method:
     *
     * ```javascript
     * class MyWidget extends PrimeFaces.widget.BaseWidget {
     *   init: function(cfg) {
     *     super.init(cfg);
     *     // custom initialization
     *   }
     * }
     * ```
     *
     * @param cfg The widget configuration to be used for this widget instance. This widget configuration is usually
     * created on the server by the `jakarta.faces.render.Renderer` for this component.
     */
    init(cfg: PrimeType.widget.PartialWidgetCfg<Cfg>): void {
        this.cfg = cfg;
        this.id = cfg.id;
        if (Array.isArray(this.id)) {
            this.jqId = $.map(this.id, function (id) {
                return core.escapeClientId(id);
            }).join(",");
        }
        else {
            this.jqId = core.escapeClientId(this.id);
        }
        this.jq = $(this.jqId);
        this.widgetVar = cfg.widgetVar;
        this.destroyListeners = [];
        this.refreshListeners = [];

        //remove script tag
        this.removeScriptElement(this.id);

        if (this.widgetVar) {
            var $this = this;
            this.jq.on("remove", function () {
                if (!core.detachedWidgets.includes($this.widgetVar)) {
                    core.detachedWidgets.push($this.widgetVar);
                }
            });
        }
    }

    /**
     * Used in ajax updates, reloads the widget configuration.
     *
     * When an AJAX call is made and this component is updated, the DOM element is replaced with the newly rendered
     * content. However, no new instance of the widget is created. Instead, after the DOM element was replaced, this
     * method is called with the new widget configuration from the server. This makes it possible to persist
     * client-side state during an update, such as the currently selected tab.
     *
     * Please note that instead of overriding this method, you should consider adding a refresh listener instead
     * via {@link addRefreshListener}. This has the advantage of letting you add multiple listeners, and makes it
     * possible to add additional listeners from code outside this widget.
     *
     * By default, this method calls all refresh listeners, then reinitializes the widget by calling the `init`
     * method.
     *
     * @param cfg The new widget configuration from the server.
     * @return {unknown} The value as returned by the `init` method, which is often `undefined`.
     */
    refresh(cfg: PrimeType.widget.PartialWidgetCfg<Cfg>): unknown {
        this.destroyListeners = [];

        if (this.refreshListeners) {
            for (const refreshListener of this.refreshListeners) {
                refreshListener.call(this, this);
            }
        }
        this.refreshListeners = [];

        var returnValue = this.init(cfg);
        return returnValue;
    }

    /**
     * Will be called after an AJAX request if the widget container will be detached.
     *
     * When an AJAX call is made and this component is updated, the DOM element is replaced with the newly rendered
     * content. When the element is removed from the DOM by the update, the DOM element is detached from the DOM and
     * this method gets called.
     *
     * Please note that instead of overriding this method, you should consider adding a destroy listener instead
     * via {@link addDestroyListener}. This has the advantage of letting you add multiple listeners, and makes it
     * possible to add additional listeners from code outside this widget.
     *
     * By default, this method just calls all destroy listeners.
     */
    destroy(): void {
        if (this.cfg.preDestroy) {
            this.cfg.preDestroy.call(this, this);
        }

        core.debug("Destroyed detached widget: " + this.widgetVar);

        if (this.destroyListeners) {
            for (const destroyListener of this.destroyListeners) {
                destroyListener.call(this, this);
            }
        }
        this.destroyListeners = [];

        // Iterate through all stored variables within this widget. If any of them are jQuery objects, 
        // it is imperative to unbind their event listeners to avoid memory leaks in the DOM.
        for (var key in this) {
            var jq = this[key];
            if (jq instanceof jQuery) {
                // remove events on all descendants
                (jq as unknown as JQuery).children().off();
                // remove events from element
                (jq as unknown as JQuery).off();
                // NOTE: do not null out the value here as is it needed sometimes still after destroy happens
                // this[key] = null; DO NOT ENABLE THIS
            }
        }
    }

    /**
     * Disables this widget, so that the user cannot interact with it anymore.
     */
    disable?(): void;

    /**
     * Enables this widget, so that the user can interact with it.
     */
    enable?(): void;

    /**
     * Checks if this widget is detached, ie whether the HTML element of this widget is currently contained within
     * the DOM (the HTML body element). A widget may become detached during an AJAX update, and it may remain
     * detached in case the update removed this component from the component tree.
     * @return `true` if this widget is currently detached, or `false` otherwise.
     */
    isDetached(): boolean {
        const id = Array.isArray(this.id) ? this.id[0] : this.id;
        return id === undefined || document.getElementById(id) === null;
    }

    /**
     * Each widget has got a container element, this method returns that container. This container element is
     * usually also the element whose ID is the client-side ID of the Faces component.
     * @return The jQuery instance representing the main HTML container element of this widget.
     */
    getJQ(): JQuery {
        return this.jq;
    }

    /**
     * Gets the ID of this widget's first container element. This is identical
     * to {@link id} in case the widget only has one container element.  
     * @returns The main ID of this widget.
     */
    getId(): string {
        return typeof this.id === "string" ? this.id : (this.id[0] ?? "");
    }

    /**
     * Gets the IDs of each of this widget's container elements, as an array.
     * This is identical to {@link id} in case the widget has multiple container
     * elements.
     * @returns The IDs of this widget's container elements.
     */
    getIds(): string[] {
        return typeof this.id === "string" ? [this.id] : this.id;
    }

    /**
     * Removes the widget's script block from the DOM. Currently, the ID of this script block consists of the
     * client-side ID of this widget with the prefix `_s`, but this is subject to change.
     *
     * @param clientId The client-side ID of the widget.
     */
    removeScriptElement(clientId: string | string[]): void {
        if (Array.isArray(clientId)) {
            $.each(clientId, function (_, id) {
                $(core.escapeClientId(id) + '_s').remove();
            });
        }
        else {
            $(core.escapeClientId(clientId) + '_s').remove();
        }
    }

    /**
     * Each widget may have one or several behaviors attached to it. This method checks whether this widget has got
     * at least one behavior associated with given event name.
     *
     * A behavior is a way for associating client-side scripts with UI components that opens all sorts of
     * possibilities, including client-side validation, DOM and style manipulation, keyboard handling, and more.
     * When the behavior is triggered, the configured JavaScript gets executed.
     *
     * Behaviors are often, but not necessarily, AJAX behavior. When triggered, it initiates a request the server
     * and processes the response once it is received. This enables several features such as updating or replacing
     * elements dynamically. You can add an AJAX behavior via
     * `<p:ajax event="name" actionListener="#{...}" onstart="..." />`.
     *
     * @param event The name of an event to check.
     * @return `true` if this widget has the given behavior, `false` otherwise.
     */
    hasBehavior(event: string): boolean {
        if (this.cfg.behaviors) {
            return this.cfg.behaviors[event] != undefined;
        }

        return false;
    }

    /**
     * Each widget may have one or several behaviors attached to it. This method calls all attached behaviors for
     * the given event name. In case no such behavior exists, this method does nothing and returns immediately.
     *
     * A behavior is a way for associating client-side scripts with UI components that opens all sorts of
     * possibilities, including client-side validation, DOM and style manipulation, keyboard handling, and more.
     * When the behavior is triggered, the configured JavaScript gets executed.
     *
     * Behaviors are often, but not necessarily, AJAX behavior. When triggered, it initiates a request the server
     * and processes the response once it is received. This enables several features such as updating or replacing
     * elements dynamically. You can add an AJAX behavior via
     * `<p:ajax event="name" actionListener="#{...}" onstart="..." />`.
     *
     * @param event The name of an event to call.
     * @param ext Additional configuration that is passed to the AJAX request for the server-side callback.
     * @param fallbackToDomEvent Whether to fallback to the DOM event if no behavior is defined.
     * @since 7.0
     */
    callBehavior(event: string, ext?: Partial<PrimeType.ajax.ConfigurationExtender>, fallbackToDomEvent = true): void {
        if (this.hasBehavior(event)) {
            this.cfg.behaviors?.[event]?.call(this, ext);
        }
        else if (fallbackToDomEvent && this.cfg.behaviors === undefined && this.jq.length > 0) {
            // #12887 if no behavior is defined, try to call the DOM event
            this.jq.trigger(event, ext);
        }
    }

    /**
     * Each widget may have one or several behaviors attached to it. This method returns the callback function for
     * the given event.
     *
     * __Note__: Do not call the method directly, the recommended way to invoke a behavior is via
     * {@link callBehavior}.
     *
     * A behavior is a way for associating client-side scripts with UI components that opens all sorts of
     * possibilities, including client-side validation, DOM and style manipulation, keyboard handling, and more.
     * When the behavior is triggered, the configured JavaScript gets executed.
     *
     * Behaviors are often, but not necessarily, AJAX behavior. When triggered, it initiates a request the server
     * and processes the response once it is received. This enables several features such as updating or replacing
     * elements dynamically. You can add an AJAX behavior via
     * `<p:ajax event="name" actionListener="#{...}" onstart="..." />`.
     *
     * @param name The name of an event for which to retrieve the behavior.
     * @return The behavior with the given name, `undefined` if no such behavior exists, and `null` if this
     * widget does not have a behaviors map configured.
     */
    getBehavior(name: string): PrimeType.widget.Behavior | null | undefined {
        return this.cfg.behaviors ? this.cfg.behaviors[name] : null;
    }

    /**
     * Lets you register a listener that is called before the component is destroyed.
     *
     * When an AJAX call is made and this component is updated, the DOM element is replaced with the newly rendered
     * content. When the element is removed from the DOM by the update, the DOM element is detached from the DOM and
     * all destroy listeners are called. This makes it possible to add listeners from outside the widget code.
     *
     * If you call this method twice with the same listener, it will be registered twice and later also called
     * twice.
     *
     * Note that for this to work, you must not override the `destroy` method; or if you do, call `super`.
     *
     * Also, after this widget was detached is done, all destroy listeners will be unregistered.
     *
     * @param listener A destroy listener to be registered.
     * @since 7.0
     */
    addDestroyListener(listener: PrimeType.widget.DestroyListener<this>): void {
        if (!this.destroyListeners) {
            this.destroyListeners = [];
        }
        this.destroyListeners.push(listener);
    }

    /**
     * When an AJAX call is made and this component is updated, the DOM element is replaced with the newly rendered
     * content. However, no new instance of the widget is created. Instead, after the DOM element was replaced, all
     * refresh listeners are called. This makes it possible to add listeners from outside the widget code.
     *
     * If you call this method twice with the same listener, it will be registered twice and later also called
     * twice.
     *
     * Note that for this to work, you must not override the `refresh` method; or if you do, call `super`.
     *
     * Also, after the refresh is done, all refresh listeners will be deregistered. If you added the listeners from
     * within this widget, consider adding the refresh listeners not only in the `init` method, but also again in
     * the `refresh` method after calling `super`.
     *
     * @param listener A refresh listener to be registered.
     * @since 7.0.0
     */
    addRefreshListener(listener: PrimeType.widget.RefreshListener<this>): void {
        if (!this.refreshListeners) {
            this.refreshListeners = [];
        }
        this.refreshListeners.push(listener);
    }

    /**
     * Gets the closest parent form for this widget.
     *
     * @return A JQuery instance that either contains the form when found, or an empty JQuery instance when
     * the form could not be found.
     * @since 10.0.0
     */
    getParentForm(): JQuery {
        return this.jq.closest('form');
    }

    /**
     * Gets the closest parent form ID for this widget lazily so it can be used in AJAX requests.
     *
     * @return Either the form ID or `undefined` if no form can be found.
     * @since 10.0.0
     */
    getParentFormId(): string | undefined {
        if (this.cfg.formId) {
            return this.cfg.formId;
        }

        //look for a parent of source
        var form = this.getParentForm();
        if (form.length > 0) {
            this.cfg.formId = form.attr('id');
        }

        return this.cfg.formId;
    }

    /**
     * Gets a localized label text for this widget.
     * @param label The label key to look up
     * @returns The label text - either from the widget configuration if specified,
     * or from the PrimeFaces global labels
     */
    getLabel<K extends keyof PrimeType.Locale>(label: K): PrimeType.Locale[K] {
        if (this.cfg.labels && typeof this.cfg.labels[label] === "string") {
            return this.cfg.labels[label];
        }
        return core.getLocaleLabel(label);
    }

    /**
     * Creates an ARIA label for an element.
     * @param label The label key to look up
     * @returns The ARIA label text - either from the widget configuration if specified, 
     * or from the PrimeFaces global ARIA labels
     */
    getAriaLabel(label: keyof PrimeType.LocaleAria): string {
        if (this.cfg.labels && this.cfg.labels.aria && this.cfg.labels.aria[label]) {
            return this.cfg.labels.aria[label];
        }
        return core.getAriaLabel(label);
    }

    // TODO: Why are the targetWidget and jqTargetId parameters necessary?
    // We are calling the target widget instance, which has this data already
    // (and often won't even need it).
    /**
     * Optional feature that can be implemented by widgets to add additional support
     * for context menus. When implemented, this is called by the context menu
     * widget when it attaches itself to a widget.
     * @param contextMenu The context menu widget that wishes to attach itself to this widget.
     * @param targetWidget This widget instance.
     * @param jqTargetId The ID selector of the main element of this widget.
     * @param cfg The configuration of the context menu widget.
     */
    bindContextMenu?(
        contextMenu: PrimeType.widget.ContextMenuLikeWidget,
        targetWidget: this,
        jqTargetId: string,
        cfg: PrimeType.widget.PartialWidgetCfg<PrimeType.widget.ContextMenuLikeWidgetCfg>,
    ): void;
}

/**
 * __PrimeFaces DynamicOverlay Widget__
 *
 * Base class for widgets that are displayed as an overlay. At any given time, several overlays may be active. This
 * requires that the z-index of the overlays is managed globally. This base class takes care of that.
 *
 * @typeParam Cfg Type of the configuration object for this widget.
 */
export class DynamicOverlayWidget<Cfg extends DynamicOverlayWidgetCfg = DynamicOverlayWidgetCfg> extends BaseWidget<Cfg> {
    /**
     * The search expression for the element to which the overlay panel should be appended.
     */
    appendTo: string | null = null;

    /**
     * The DOM element that is displayed as an overlay with the appropriate `z-index` and `position`. It is usually a
     * child of the `body` element.
     */
    modalOverlay: JQuery | null = null;

    /**
     * @param The DOM element for the overlay.
     * @param The ID of the overlay, usually the widget ID.
     * @param The DOM element that is the target of this overlay
     */
    override init(cfg: PrimeType.widget.PartialWidgetCfg<Cfg>, overlay?: JQuery, overlayId?: string, target?: JQuery): void {
        super.init(cfg);

        // do not bind overlay if widget disabled
        if (this.cfg.disabled === true) {
            return;
        }

        if (!overlay) {
            overlay = this.jq;
        }

        if (!overlayId) {
            overlayId = this.getId();
        }

        if (!target) {
            target = this.jq;
        }

        const ignoreAppendTo = core.isWidgetOfTypeName(this, "Dialog");
        if (!ignoreAppendTo) {
            this.cfg.appendTo = utils.resolveAppendTo(this, target, overlay);
        }

        utils.registerDynamicOverlay(this, overlay, overlayId);
    }

    override refresh(cfg: PrimeType.widget.PartialWidgetCfg<Cfg>): void {
        utils.removeModal(this, this.modalOverlay);

        this.appendTo = null;
        this.modalOverlay = null;

        super.refresh(cfg);
    }

    override destroy(): void {
        super.destroy();

        utils.removeModal(this);

        this.appendTo = null;
        this.modalOverlay = null;
    }

    /**
     * Enables modality for this widget and creates the modal overlay element, but does not change whether the
     * overlay is currently displayed.
     * @param overlay The target overlay, if not given defaults to {@link jq}.
     */
    enableModality(overlay?: JQuery | null): void {
        const target = overlay || this.jq;
        this.modalOverlay = utils.addModal(this, target, () => this.getModalTabbables() ?? $());
    }

    /**
     * Disabled modality for this widget and removes the modal overlay element, but does not change whether the
     * overlay is currently displayed.
     * @param overlay The target overlay, if not given defaults to {@link jq}.
     */
    disableModality(overlay?: JQuery | null | undefined): void {
        var target = overlay || this.jq;
        utils.removeModal(this, target);
        this.modalOverlay = null;
    }

    /**
     * This class makes sure a user cannot tab out of the modal and it stops events from targets outside of the
     * overlay element. This requires that we switch back to the modal in case a user tabs out of it. What must
     * be returned by this method are the elements to which the user may switch via tabbing.
     * @return The DOM elements which are allowed to be focused via tabbing. May be an empty `jQuery`
     * instance or `null`, when the modal contains no tabbable elements.
     */
    protected getModalTabbables(): JQuery | null {
        return null;
    }
}

/**
 * __PrimeFaces Deferred Widget__
 *
 * Base class for widgets that require their container to be visible to initialize properly.
 *
 * For example, a widget may need to know the width and height of its container so that it can resize itself
 * properly.
 *
 * Do not call the {@link render} or {@link _render} method directly in the {@link init} method. Instead, call
 * {@link renderDeferred}. PrimeFaces will then check whether the widget is visible and call the {@link _render}
 * method once it is. Make sure you actually override the {@link _render} method, as the default implementation
 * throws an error.
 *
 * ```javascript
 * class MyWidget extends PrimeFaces.widget.DeferredWidget {
 *   init(cfg) {
 *     super.init(cfg);
 *
 *     // more code if needed
 *     // ...
 *
 *     // Render this widget once its container is visible.
 *     this.renderDeferred();
 *   }
 *
 *   _render() {
 *     // Perform your render logic here, create DOM elements etc.
 *   }
 * }
 * ```
 */
export class DeferredWidget<Cfg extends DeferredWidgetCfg = DeferredWidgetCfg> extends BaseWidget<Cfg> {

    /**
     * Call this method in the {@link init} method if you want deferred rendering support. This method checks
     * whether the container of this widget is visible and call {@link _render} only once it is.
     */
    renderDeferred(): void {
        if (this.jq.is(':visible')) {
            this._render();
            this.postRender();
        }
        else if (this.jq[0]) {
            var container = this.jq[0].closest('.ui-hidden-container');
            if (container instanceof HTMLElement) {
                var $container = $(container);
                if ($container.length) {
                    var $this = this;
                    this.addDeferredRender(this.id, $container, () => {
                        return $this.render();
                    });
                }
            }
        }
    }

    /**
     * This render method to check whether the widget container is visible. Do not override this method, or the
     * deferred widget functionality may not work properly anymore.
     *
     * @return `true` if the widget container is visible, `false` or `undefined` otherwise.
     */
    render(): boolean | undefined | void {
        if (this.jq.is(':visible')) {
            this._render();
            this.postRender();
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * This render method is called by this deferred widget once the widget container has become visible. You may
     * now proceed with widget initialization.
     *
     * __Must be overridden__, or an error will be thrown.
     */
    protected _render(): void {
        throw new Error("Unsupported Operation");
    }

    /**
     * Called after the widget has become visible and after it was rendered. May be overridden, the default
     * implementation is a no-op.
     */
    protected postRender(): void {
    }

    /**
     * Cleans up deferred render tasks. When you extend this class and override this method, make sure to call
     * `super`.
     */
    override destroy(): void {
        super.destroy();
        core.removeDeferredRenders(this.id);
    }

    /**
     * Adds a deferred rendering task for the given widget to the queue.
     * @param widgetId The ID of a deferred widget.
     * @param container The container element that should be visible.
     * @param callback Callback that is invoked when the widget _may_ possibly have become visible.
     * Should return `true` when the widget was rendered, or `false` when the widget still needs to be rendered
     * later.
     */
    protected addDeferredRender(widgetId: string | string[], container: JQuery, callback: () => boolean | undefined | void): void {
        core.addDeferredRender(widgetId, container.attr('id') ?? "", callback);

        if (container.is(':hidden')) {
            var parentContainer = this.jq.closest('.ui-hidden-container');

            if (parentContainer.length) {
                this.addDeferredRender(widgetId, container.parent().closest('.ui-hidden-container'), callback);
            }
        }
    }
}
