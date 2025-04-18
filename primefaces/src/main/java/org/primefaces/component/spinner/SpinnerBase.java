/*
 * The MIT License
 *
 * Copyright (c) 2009-2025 PrimeTek Informatics
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package org.primefaces.component.spinner;

import org.primefaces.component.api.AbstractPrimeHtmlInputText;
import org.primefaces.component.api.InputHolder;
import org.primefaces.component.api.RTLAware;
import org.primefaces.component.api.Widget;
import org.primefaces.util.LocaleUtils;

public abstract class SpinnerBase extends AbstractPrimeHtmlInputText implements Widget, InputHolder, RTLAware {

    public static final String COMPONENT_FAMILY = "org.primefaces.component";

    public static final String DEFAULT_RENDERER = "org.primefaces.component.SpinnerRenderer";

    public enum PropertyKeys {
        placeholder,
        widgetVar,
        stepFactor,
        min,
        max,
        prefix,
        suffix,
        decimalPlaces,
        decimalSeparator,
        thousandSeparator,
        rotate,
        round,
        buttons,
        upIcon,
        downIcon,
        upButtonStyleClass,
        downButtonStyleClass,
        modifyValueOnWheel
    }

    public static final String BUTTONS_STACKED = "stacked";
    public static final String BUTTONS_HORIZONTAL = "horizontal";
    public static final String BUTTONS_HORIZONTAL_AFTER = "horizontal-after";
    public static final String BUTTONS_VERTICAL = "vertical";
    public static final Double MAX_VALUE = Double.MAX_VALUE;
    public static final Double MIN_VALUE = -Double.MAX_VALUE;

    public SpinnerBase() {
        setRendererType(DEFAULT_RENDERER);
    }

    @Override
    public String getFamily() {
        return COMPONENT_FAMILY;
    }

    public String getPlaceholder() {
        return (String) getStateHelper().eval(PropertyKeys.placeholder, null);
    }

    public void setPlaceholder(String placeholder) {
        getStateHelper().put(PropertyKeys.placeholder, placeholder);
    }

    public String getWidgetVar() {
        return (String) getStateHelper().eval(PropertyKeys.widgetVar, null);
    }

    public void setWidgetVar(String widgetVar) {
        getStateHelper().put(PropertyKeys.widgetVar, widgetVar);
    }

    public double getStepFactor() {
        return (Double) getStateHelper().eval(PropertyKeys.stepFactor, 1.0);
    }

    public void setStepFactor(double stepFactor) {
        getStateHelper().put(PropertyKeys.stepFactor, stepFactor);
    }

    public double getMin() {
        return (Double) getStateHelper().eval(PropertyKeys.min, MIN_VALUE);
    }

    public void setMin(double min) {
        getStateHelper().put(PropertyKeys.min, min);
    }

    public double getMax() {
        return (Double) getStateHelper().eval(PropertyKeys.max, MAX_VALUE);
    }

    public void setMax(double max) {
        getStateHelper().put(PropertyKeys.max, max);
    }

    public String getPrefix() {
        return (String) getStateHelper().eval(PropertyKeys.prefix, null);
    }

    public void setPrefix(String prefix) {
        getStateHelper().put(PropertyKeys.prefix, prefix);
    }

    public String getSuffix() {
        return (String) getStateHelper().eval(PropertyKeys.suffix, null);
    }

    public void setSuffix(String suffix) {
        getStateHelper().put(PropertyKeys.suffix, suffix);
    }

    public String getDecimalPlaces() {
        return (String) getStateHelper().eval(PropertyKeys.decimalPlaces, null);
    }

    public void setDecimalPlaces(String decimalPlaces) {
        getStateHelper().put(PropertyKeys.decimalPlaces, decimalPlaces);
    }

    public String getDecimalSeparator() {
        return (String) getStateHelper().eval(PropertyKeys.decimalSeparator,
            () -> LocaleUtils.getDecimalSeparator(getFacesContext()));
    }

    public void setDecimalSeparator(String decimalSeparator) {
        getStateHelper().put(PropertyKeys.decimalSeparator, decimalSeparator);
    }

    public String getThousandSeparator() {
        return (String) getStateHelper().eval(PropertyKeys.thousandSeparator,
            () -> LocaleUtils.getThousandSeparator(getFacesContext()));
    }

    public void setThousandSeparator(String thousandSeparator) {
        getStateHelper().put(PropertyKeys.thousandSeparator, thousandSeparator);
    }

    public boolean isRotate() {
        return (Boolean) getStateHelper().eval(PropertyKeys.rotate, false);
    }

    public void setRotate(boolean rotate) {
        getStateHelper().put(PropertyKeys.rotate, rotate);
    }

    public boolean isRound() {
        return (Boolean) getStateHelper().eval(PropertyKeys.round, false);
    }

    public void setRound(boolean round) {
        getStateHelper().put(PropertyKeys.round, round);
    }

    public String getButtons() {
        return (String) getStateHelper().eval(PropertyKeys.buttons, BUTTONS_STACKED);
    }

    public void setButtons(String buttons) {
        getStateHelper().put(PropertyKeys.buttons, buttons);
    }

    public String getUpIcon() {
        return (String) getStateHelper().eval(PropertyKeys.upIcon, null);
    }

    public void setUpIcon(String upIcon) {
        getStateHelper().put(PropertyKeys.upIcon, upIcon);
    }

    public String getDownIcon() {
        return (String) getStateHelper().eval(PropertyKeys.downIcon, null);
    }

    public void setDownIcon(String downIcon) {
        getStateHelper().put(PropertyKeys.downIcon, downIcon);
    }

    public String getUpButtonStyleClass() {
        return (String) getStateHelper().eval(PropertyKeys.upButtonStyleClass, null);
    }

    public void setUpButtonStyleClass(String upButtonStyleClass) {
        getStateHelper().put(PropertyKeys.upButtonStyleClass, upButtonStyleClass);
    }

    public String getDownButtonStyleClass() {
        return (String) getStateHelper().eval(PropertyKeys.downButtonStyleClass, null);
    }

    public void setDownButtonStyleClass(String downButtonStyleClass) {
        getStateHelper().put(PropertyKeys.downButtonStyleClass, downButtonStyleClass);
    }

    public boolean isModifyValueOnWheel() {
        return (Boolean) getStateHelper().eval(PropertyKeys.modifyValueOnWheel, true);
    }

    public void setModifyValueOnWheel(boolean modifyValueOnWheel) {
        getStateHelper().put(PropertyKeys.modifyValueOnWheel, modifyValueOnWheel);
    }

}