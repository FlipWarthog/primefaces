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
package org.primefaces.component.chart;

import org.primefaces.event.ItemSelectEvent;
import org.primefaces.util.MapBuilder;

import java.util.Collection;
import java.util.Map;

import jakarta.faces.application.ResourceDependency;
import jakarta.faces.event.AjaxBehaviorEvent;
import jakarta.faces.event.BehaviorEvent;
import jakarta.faces.event.FacesEvent;

@ResourceDependency(library = "primefaces", name = "jquery/jquery.js")
@ResourceDependency(library = "primefaces", name = "core.js")
@ResourceDependency(library = "primefaces", name = "components.js")
@ResourceDependency(library = "primefaces", name = "moment/moment.js")
@ResourceDependency(library = "primefaces", name = "chart/chart.js")
public class Chart extends ChartBase {

    private static final String DEFAULT_EVENT = "itemSelect";

    private static final Map<String, Class<? extends BehaviorEvent>> BEHAVIOR_EVENT_MAPPING = MapBuilder.<String, Class<? extends BehaviorEvent>>builder()
            .put("itemSelect", ItemSelectEvent.class)
            .build();

    private static final Collection<String> EVENT_NAMES = BEHAVIOR_EVENT_MAPPING.keySet();

    @Override
    public Map<String, Class<? extends BehaviorEvent>> getBehaviorEventMapping() {
        return BEHAVIOR_EVENT_MAPPING;
    }

    @Override
    public Collection<String> getEventNames() {
        return EVENT_NAMES;
    }

    @Override
    public String getDefaultEventName() {
        return DEFAULT_EVENT;
    }

    @Override
    public void queueEvent(FacesEvent event) {
        if (event instanceof AjaxBehaviorEvent) {
            BehaviorEvent behaviorEvent = (AjaxBehaviorEvent) event;
            Map<String, String> map = getFacesContext().getExternalContext().getRequestParameterMap();
            int itemIndex = Integer.parseInt(map.get("itemIndex"));
            int dataSetIndex = Integer.parseInt(map.get("dataSetIndex"));
            String data = map.get("data");

            ItemSelectEvent itemSelectEvent = new ItemSelectEvent(this, behaviorEvent.getBehavior(), itemIndex, dataSetIndex, data);

            super.queueEvent(itemSelectEvent);
        }
        else {
            super.queueEvent(event);
        }
    }
}
