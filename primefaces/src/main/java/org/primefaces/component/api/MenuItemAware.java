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
package org.primefaces.component.api;

import org.primefaces.event.MenuActionEvent;
import org.primefaces.model.menu.MenuElement;
import org.primefaces.model.menu.MenuItem;

import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;

import jakarta.el.ELContext;
import jakarta.el.ExpressionFactory;
import jakarta.el.MethodExpression;
import jakarta.el.MethodNotFoundException;
import jakarta.faces.context.FacesContext;
import jakarta.faces.event.AbortProcessingException;
import jakarta.faces.event.ActionEvent;
import jakarta.faces.event.FacesEvent;

public interface MenuItemAware {

    Class<?>[] PARAMS_EMPTY = new Class<?>[0];
    Class<?>[] PARAMS_ACTION_EVENT = new Class<?>[]{ActionEvent.class};
    Class<?>[] PARAMS_MENU_ACTION_EVENT = new Class<?>[]{MenuActionEvent.class};

    List<MenuElement> getElements();

    default void broadcastMenuActionEvent(FacesEvent event, FacesContext context, Consumer<FacesEvent> broadcast) throws AbortProcessingException {
        if (event instanceof MenuActionEvent) {
            MenuActionEvent menuActionEvent = (MenuActionEvent) event;
            MenuItem menuItem = menuActionEvent.getMenuItem();

            Function<MenuItem, String> function = menuItem.getFunction();
            String command = menuItem.getCommand();
            if (function != null) {
                String outcome = function.apply(menuItem);
                context.getApplication().getNavigationHandler().handleNavigation(context, null, outcome);
            }
            else if (command != null) {
                ELContext elContext = context.getELContext();
                ExpressionFactory expressionFactory = context.getApplication().getExpressionFactory();

                Object invokeResult = null;
                try {
                    MethodExpression me = expressionFactory.createMethodExpression(elContext, command,
                            String.class, PARAMS_EMPTY);
                    invokeResult = me.invoke(elContext, null);
                }
                catch (MethodNotFoundException mnfe1) {
                    try {
                        MethodExpression me = expressionFactory.createMethodExpression(elContext, command,
                                String.class, PARAMS_ACTION_EVENT);
                        invokeResult = me.invoke(elContext, new Object[]{event});
                    }
                    catch (MethodNotFoundException mnfe2) {
                        MethodExpression me = expressionFactory.createMethodExpression(elContext, command,
                                String.class, PARAMS_MENU_ACTION_EVENT);
                        invokeResult = me.invoke(elContext, new Object[]{event});
                    }
                }
                finally {
                    String outcome = (invokeResult != null) ? invokeResult.toString() : null;

                    context.getApplication().getNavigationHandler().handleNavigation(context, command, outcome);
                }
            }
        }
        else {
            broadcast.accept(event);
        }
    }
}
