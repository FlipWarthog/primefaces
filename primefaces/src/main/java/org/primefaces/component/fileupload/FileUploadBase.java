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
package org.primefaces.component.fileupload;

import org.primefaces.component.api.Widget;

import jakarta.faces.component.UIInput;

public abstract class FileUploadBase extends UIInput implements Widget {

    public static final String COMPONENT_FAMILY = "org.primefaces.component";

    public static final String DEFAULT_RENDERER = "org.primefaces.component.FileUploadRenderer";

    public enum PropertyKeys {

        accept,
        auto,
        cancelButtonStyleClass,
        cancelButtonTitle,
        cancelIcon,
        cancelLabel,
        chooseButtonStyleClass,
        chooseButtonTitle,
        chooseIcon,
        disabled,
        displayFilename,
        dragDrop,
        dropZone,
        global,
        ignoreAutoUpdate,
        label,
        listener,
        maxChunkSize,
        maxRetries,
        messageTemplate,
        mode,
        multiple,
        onAdd,
        oncancel,
        oncomplete,
        onerror,
        onstart,
        onupload,
        onvalidationfailure,
        previewWidth,
        process,
        retryTimeout,
        sequential,
        skinSimple,
        style,
        styleClass,
        title,
        update,
        uploadButtonStyleClass,
        uploadButtonTitle,
        uploadIcon,
        uploadLabel,
        widgetVar
    }

    public FileUploadBase() {
        setRendererType(DEFAULT_RENDERER);
    }

    @Override
    public String getFamily() {
        return COMPONENT_FAMILY;
    }

    public String getWidgetVar() {
        return (String) getStateHelper().eval(PropertyKeys.widgetVar, null);
    }

    public void setWidgetVar(String widgetVar) {
        getStateHelper().put(PropertyKeys.widgetVar, widgetVar);
    }

    public String getStyle() {
        return (String) getStateHelper().eval(PropertyKeys.style, null);
    }

    public void setStyle(String style) {
        getStateHelper().put(PropertyKeys.style, style);
    }

    public String getStyleClass() {
        return (String) getStateHelper().eval(PropertyKeys.styleClass, null);
    }

    public void setStyleClass(String styleClass) {
        getStateHelper().put(PropertyKeys.styleClass, styleClass);
    }

    public String getUpdate() {
        return (String) getStateHelper().eval(PropertyKeys.update, null);
    }

    public void setUpdate(String update) {
        getStateHelper().put(PropertyKeys.update, update);
    }

    public String getProcess() {
        return (String) getStateHelper().eval(PropertyKeys.process, null);
    }

    public void setProcess(String process) {
        getStateHelper().put(PropertyKeys.process, process);
    }

    public jakarta.el.MethodExpression getListener() {
        return (jakarta.el.MethodExpression) getStateHelper().eval(PropertyKeys.listener, null);
    }

    public void setListener(jakarta.el.MethodExpression fileUploadListener) {
        getStateHelper().put(PropertyKeys.listener, fileUploadListener);
    }

    public boolean isMultiple() {
        return (Boolean) getStateHelper().eval(PropertyKeys.multiple, false);
    }

    public void setMultiple(boolean multiple) {
        getStateHelper().put(PropertyKeys.multiple, multiple);
    }

    public boolean isAuto() {
        return (Boolean) getStateHelper().eval(PropertyKeys.auto, false);
    }

    public void setAuto(boolean auto) {
        getStateHelper().put(PropertyKeys.auto, auto);
    }

    public String getLabel() {
        return (String) getStateHelper().eval(PropertyKeys.label, "Choose");
    }

    public void setLabel(String label) {
        getStateHelper().put(PropertyKeys.label, label);
    }

    public String getMode() {
        return (String) getStateHelper().eval(PropertyKeys.mode, "advanced");
    }

    public void setMode(String mode) {
        getStateHelper().put(PropertyKeys.mode, mode);
    }

    public String getUploadLabel() {
        return (String) getStateHelper().eval(PropertyKeys.uploadLabel, "Upload");
    }

    public void setUploadLabel(String uploadLabel) {
        getStateHelper().put(PropertyKeys.uploadLabel, uploadLabel);
    }

    public String getCancelLabel() {
        return (String) getStateHelper().eval(PropertyKeys.cancelLabel, "Cancel");
    }

    public void setCancelLabel(String cancelLabel) {
        getStateHelper().put(PropertyKeys.cancelLabel, cancelLabel);
    }

    public boolean isDragDrop() {
        return (Boolean) getStateHelper().eval(PropertyKeys.dragDrop, true);
    }

    public void setDragDrop(boolean dragDrop) {
        getStateHelper().put(PropertyKeys.dragDrop, dragDrop);
    }

    public String getOnstart() {
        return (String) getStateHelper().eval(PropertyKeys.onstart, null);
    }

    public void setOnstart(String onstart) {
        getStateHelper().put(PropertyKeys.onstart, onstart);
    }

    public String getOnupload() {
        return (String) getStateHelper().eval(PropertyKeys.onupload, null);
    }

    public void setOnupload(String onupload) {
        getStateHelper().put(PropertyKeys.onupload, onupload);
    }

    public String getOncomplete() {
        return (String) getStateHelper().eval(PropertyKeys.oncomplete, null);
    }

    public void setOncomplete(String oncomplete) {
        getStateHelper().put(PropertyKeys.oncomplete, oncomplete);
    }

    public String getOnvalidationfailure() {
        return (String) getStateHelper().eval(PropertyKeys.onvalidationfailure, null);
    }

    public void setOnvalidationfailure(String onvalidationfailure) {
        getStateHelper().put(PropertyKeys.onvalidationfailure, onvalidationfailure);
    }

    public String getOnerror() {
        return (String) getStateHelper().eval(PropertyKeys.onerror, null);
    }

    public void setOnerror(String onerror) {
        getStateHelper().put(PropertyKeys.onerror, onerror);
    }

    public String getOncancel() {
        return (String) getStateHelper().eval(PropertyKeys.oncancel, null);
    }

    public void setOncancel(String oncancel) {
        getStateHelper().put(PropertyKeys.oncancel, oncancel);
    }

    public boolean isDisabled() {
        return (Boolean) getStateHelper().eval(PropertyKeys.disabled, false);
    }

    public void setDisabled(boolean disabled) {
        getStateHelper().put(PropertyKeys.disabled, disabled);
    }

    public String getMessageTemplate() {
        return (String) getStateHelper().eval(PropertyKeys.messageTemplate, null);
    }

    public void setMessageTemplate(String messageTemplate) {
        getStateHelper().put(PropertyKeys.messageTemplate, messageTemplate);
    }

    public int getPreviewWidth() {
        return (Integer) getStateHelper().eval(PropertyKeys.previewWidth, 80);
    }

    public void setPreviewWidth(int previewWidth) {
        getStateHelper().put(PropertyKeys.previewWidth, previewWidth);
    }

    public boolean isSkinSimple() {
        return (Boolean) getStateHelper().eval(PropertyKeys.skinSimple, false);
    }

    public void setSkinSimple(boolean skinSimple) {
        getStateHelper().put(PropertyKeys.skinSimple, skinSimple);
    }

    public String getAccept() {
        return (String) getStateHelper().eval(PropertyKeys.accept, null);
    }

    public void setAccept(String accept) {
        getStateHelper().put(PropertyKeys.accept, accept);
    }

    public boolean isSequential() {
        return (Boolean) getStateHelper().eval(PropertyKeys.sequential, false);
    }

    public void setSequential(boolean sequential) {
        getStateHelper().put(PropertyKeys.sequential, sequential);
    }

    public String getChooseIcon() {
        return (String) getStateHelper().eval(PropertyKeys.chooseIcon, "pi pi-plus");
    }

    public void setChooseIcon(String chooseIcon) {
        getStateHelper().put(PropertyKeys.chooseIcon, chooseIcon);
    }

    public String getUploadIcon() {
        return (String) getStateHelper().eval(PropertyKeys.uploadIcon, "pi pi-upload");
    }

    public void setUploadIcon(String uploadIcon) {
        getStateHelper().put(PropertyKeys.uploadIcon, uploadIcon);
    }

    public String getCancelIcon() {
        return (String) getStateHelper().eval(PropertyKeys.cancelIcon, "pi pi-times");
    }

    public void setCancelIcon(String cancelIcon) {
        getStateHelper().put(PropertyKeys.cancelIcon, cancelIcon);
    }

    public String getOnAdd() {
        return (String) getStateHelper().eval(PropertyKeys.onAdd, null);
    }

    public void setOnAdd(String onAdd) {
        getStateHelper().put(PropertyKeys.onAdd, onAdd);
    }

    public Long getMaxChunkSize() {
        return (Long) getStateHelper().eval(PropertyKeys.maxChunkSize, 0L);
    }

    public void setMaxChunkSize(Long maxChunkSize) {
        getStateHelper().put(PropertyKeys.maxChunkSize, maxChunkSize);
    }

    public int getMaxRetries() {
        return (Integer) getStateHelper().eval(PropertyKeys.maxRetries, 30);
    }

    public void setMaxRetries(int maxRetries) {
        getStateHelper().put(PropertyKeys.maxRetries, maxRetries);
    }

    public int getRetryTimeout() {
        return (Integer) getStateHelper().eval(PropertyKeys.retryTimeout, 1000);
    }

    public void setRetryTimeout(int retryTimeout) {
        getStateHelper().put(PropertyKeys.retryTimeout, retryTimeout);
    }

    public String getTitle() {
        return (String) getStateHelper().eval(PropertyKeys.title, null);
    }

    public void setTitle(String title) {
        getStateHelper().put(PropertyKeys.title, title);
    }

    public String getChooseButtonTitle() {
        return (String) getStateHelper().eval(PropertyKeys.chooseButtonTitle, null);
    }

    public void setChooseButtonTitle(String chooseButtonTitle) {
        getStateHelper().put(PropertyKeys.chooseButtonTitle, chooseButtonTitle);
    }

    public String getUploadButtonTitle() {
        return (String) getStateHelper().eval(PropertyKeys.uploadButtonTitle, null);
    }

    public void setUploadButtonTitle(String uploadButtonTitle) {
        getStateHelper().put(PropertyKeys.uploadButtonTitle, uploadButtonTitle);
    }

    public String getCancelButtonTitle() {
        return (String) getStateHelper().eval(PropertyKeys.cancelButtonTitle, null);
    }

    public void setCancelButtonTitle(String cancelButtonTitle) {
        getStateHelper().put(PropertyKeys.cancelButtonTitle, cancelButtonTitle);
    }

    public boolean isGlobal() {
        return (Boolean) getStateHelper().eval(PropertyKeys.global, true);
    }

    public void setGlobal(boolean global) {
        getStateHelper().put(PropertyKeys.global, global);
    }

    public String getChooseButtonStyleClass() {
        return (String) getStateHelper().eval(PropertyKeys.chooseButtonStyleClass, null);
    }

    public void setChooseButtonStyleClass(String chooseButtonStyleClass) {
        getStateHelper().put(PropertyKeys.chooseButtonStyleClass, chooseButtonStyleClass);
    }

    public String getUploadButtonStyleClass() {
        return (String) getStateHelper().eval(PropertyKeys.uploadButtonStyleClass, null);
    }

    public void setUploadButtonStyleClass(String uploadButtonStyleClass) {
        getStateHelper().put(PropertyKeys.uploadButtonStyleClass, uploadButtonStyleClass);
    }

    public String getCancelButtonStyleClass() {
        return (String) getStateHelper().eval(PropertyKeys.cancelButtonStyleClass, null);
    }

    public void setCancelButtonStyleClass(String cancelButtonStyleClass) {
        getStateHelper().put(PropertyKeys.cancelButtonStyleClass, cancelButtonStyleClass);
    }

    public String getDropZone() {
        return (String) getStateHelper().eval(PropertyKeys.dropZone, null);
    }

    public void setDropZone(String dropZone) {
        getStateHelper().put(PropertyKeys.dropZone, dropZone);
    }

    public boolean isDisplayFilename() {
        return (boolean) getStateHelper().eval(PropertyKeys.displayFilename, () -> !(getMode().equals("simple") && isAuto()));
    }

    public void setDisplayFilename(boolean displayFilename) {
        getStateHelper().put(PropertyKeys.displayFilename, displayFilename);
    }

    public boolean isIgnoreAutoUpdate() {
        return (Boolean) getStateHelper().eval(PropertyKeys.ignoreAutoUpdate, false);
    }

    public void setIgnoreAutoUpdate(boolean ignoreAutoUpdate) {
        getStateHelper().put(PropertyKeys.ignoreAutoUpdate, ignoreAutoUpdate);
    }
}
