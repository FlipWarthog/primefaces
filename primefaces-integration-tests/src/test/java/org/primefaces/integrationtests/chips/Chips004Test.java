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
package org.primefaces.integrationtests.chips;

import org.primefaces.selenium.AbstractPrimePage;
import org.primefaces.selenium.AbstractPrimePageTest;
import org.primefaces.selenium.component.Chips;
import org.primefaces.selenium.component.CommandButton;
import org.primefaces.selenium.component.InputText;
import org.primefaces.selenium.component.Messages;

import java.util.List;

import org.json.JSONObject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.FindBy;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Chips004Test extends AbstractPrimePageTest {

    // can't get copy and paste working on Safari
    @Test
    @Order(1)
    @DisplayName("Chips: GitHub #1895/#6691: Chips allow pasting of delimited list")
    @Tag("SafariExclude")
    void clipboardPaste(Page page) {
        // Arrange
        Chips chips = page.chips;
        InputText clipboard = page.clipboard;

        // Assert initial state
        assertEquals("apple;orange;banana", clipboard.getValue());
        assertEquals("", chips.getText());
        List<String> values = chips.getValues();
        assertEquals(0, values.size());

        // Act - add values and submit
        clipboard.copyToClipboard();
        chips.pasteFromClipboard();
        page.button.click();

        // Assert
        assertEquals("apple, orange, banana", page.messages.getMessage(0).getSummary());
        values = chips.getValues();
        assertEquals(3, values.size());
        assertEquals("apple", values.get(0));
        assertEquals("orange", values.get(1));
        assertEquals("banana", values.get(2));
        assertConfiguration(chips.getWidgetConfiguration());
    }

    @Test
    @Order(2)
    @DisplayName("Chips: GitHub #6691: Chips toggle editor between list and tokens")
    void toggleEditor(Page page) {
        // Arrange
        Chips chips = page.chips;

        // Assert initial state
        assertEquals("", chips.getText());
        List<String> values = chips.getValues();
        assertEquals(0, values.size());

        // Act - add values and toggle editor
        chips.addValue("Excel");
        chips.addValue("Outlook");
        chips.addValue("Word");
        chips.toggleEditor();

        // Assert (editing mode)
        assertEquals("Excel;Outlook;Word", chips.getInput().getAttribute("value"));

        // Act - close editor and submit
        chips.toggleEditor();
        page.button.click();

        // Assert (final values)
        values = chips.getValues();
        assertEquals(3, values.size());
        assertEquals("Excel", values.get(0));
        assertEquals("Outlook", values.get(1));
        assertEquals("Word", values.get(2));
        assertConfiguration(chips.getWidgetConfiguration());
    }

    private void assertConfiguration(JSONObject cfg) {
        assertNoJavascriptErrors();
        System.out.println("Chips Config = " + cfg);
        assertTrue(cfg.has("id"));
        assertTrue(cfg.getBoolean("addOnPaste"));
        assertEquals(";", cfg.get("separator"));
    }

    public static class Page extends AbstractPrimePage {
        @FindBy(id = "form:msgs")
        Messages messages;

        @FindBy(id = "form:clipboard")
        InputText clipboard;

        @FindBy(id = "form:chips")
        Chips chips;

        @FindBy(id = "form:button")
        CommandButton button;

        @Override
        public String getLocation() {
            return "chips/chips004.xhtml";
        }
    }
}
