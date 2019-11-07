/*
Copyright 2019 LEE DONG GUN.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(
    function (factory){
        if (typeof define === 'function' && define.amd){
            define(['jquery'], factory);
        }
        else if(typeof module !== 'undefined' && module.exports) {
            module.exports = factory(require('jquery'));
        }
        else {
            factory(jQuery);
        }
    }
    (
        function($, undefined){
            if($.jsolext){
                return;
            }
            let instance_counter = 0;
            
            $.jsolext = {
                /**
                 * 현재 js 파일의 버전을 표시합니다.
                 * @name $.jsolext.version
                 */
                version : '0.0.1-alpha'
            };
            
            $.jsolext.style = {
                
            };
            $.jsolext.create = function (el, option){
                var tmp = new $.jsolext.core(++instance_counter);
                $(el).data('jsolext', tmp);
                tmp.init(el, option);
                return tmp;
            };
            $.jsolext.core = function(id){
                this._id = id;
                return this;
            };
            $.jsolext.core.prototype = {
                init:function(option){
                    this.map = new ol.Map(option);
                    this.target_element = option.target;
                    this.Feature.core=this;
                    this.Layer.core = this;
                    this.layers = {};
                    return this;
                },
                CoordinateFromPixel : function(pixel, toFixed){
                    const coordinate = this.map.getCoordinateFromPixel(pixel);
                    const longlat = ol.proj.transform(coordinate, 'EPSG:3857','EPSG:4326');
                    const fixed = (toFixed)?toFixed : 8;
                    const longitude = longlat[0].toFixed(fixed);
                    const latitude = longlat[1].toFixed(fixed);
                    return [longitude, latitude];
                },
                addEvent:function(Handle, Event){
                    this.map.getViewport().addEventListener(Handle, Event);
                    return this;
                },
                getDataInformation:function(){
                    let data = {};
                    for(let key in this.layers){
                        data[key] = this.layers[key].data.length;
                    }
                    return data;
                },
                moveCenter:function(coordinates,zoom=17){
                    this.map.getView().setCenter(ol.proj.transform([coordinates[0], coordinates[1]], 'EPSG:4326', 'EPSG:3857'));
                    this.map.getView().setZoom(zoom);
                    return this;
                },
                getEventPixel:function(e){
                    return this.map.getEventPixel(e);
                },
                forEachFeatureAtPixel:function(pixel, func){
                    return this.map.forEachFeatureAtPixel(pixel, func);
                },
                DisableDoubleClickZoom:function(){
                    let DoubleClickZoomEvent;
                    this.map.getInteractions().getArray().forEach(function(interaction) {
                        if (interaction instanceof ol.interaction.DoubleClickZoom) {
                            DoubleClickZoomEvent = interaction;
                        }
                    });
                    this.map.removeInteraction(DoubleClickZoomEvent);
                    return this;
                },
                Style:{
                    addColor:function(name, color){
                        this[name] = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 2,
                                stroke: new ol.style.Stroke({
                                    color: color
                                }),
                                fill: new ol.style.Fill({
                                    color: color
                                })
                            }),
                            stroke: new ol.style.Stroke({
                                color: color
                                
                            }),
                            fill: new ol.style.Fill({
                                color: color
                            })
                        });
                        return this;
                    },
                    addIcon:function(name, src, anchor, opacity, scale){
                        this[name] = new ol.style.Style({
                            image: new ol.style.Icon( ({
                                anchor: anchor,
                                anchorXUnits: 'pixels',
                                anchorYUnits: 'pixels',
                                opacity: opacity,
                                scale: scale,
                                src: src
                            }))
                        });
                        return this;
                    }
                },
                Feature:{
                    core:null,
                    InsertFromPoint:function(layer_key,coordinates, properties, style){
                        const Point = new ol.geom.Point(ol.proj.transform([coordinates[0], coordinates[1]], 'EPSG:4326', 'EPSG:3857'));
                        const Feature = new ol.Feature(Point);
                        properties.featureType = "Point";
                        properties.coordinates = coordinates;
                        Feature.properties = properties;
                        Feature.hidden = false;
                        this.SetStyle(Feature, style);
                        const layer = this.core.Layer.Load(layer_key);
                        layer.getSource().addFeature( Feature );
                        this.core.layers[layer_key].data.push(Feature);
                        return this.core;
                    },
                    InsertFromPolygon:function(layer_key,coordinates, properties, style){
                        const c_coordinate = [[]];
                        for(var i =0;i<coordinates.length;i+=2){
                            c_coordinate[0].push(ol.proj.transform([coordinates[i], coordinates[i+1]], 'EPSG:4326', 'EPSG:3857'));
                        }
                        
                        const Polygon = new ol.geom.Polygon(c_coordinate);
                        const Feature = new ol.Feature(Polygon);
                        properties.featureType = "Polygon";
                        properties.coordinates = coordinates;
                        Feature.properties = properties;
                        Feature.hidden = false;
                        this.SetStyle(Feature, style);
                        const layer = this.core.Layer.Load(layer_key);
                        layer.getSource().addFeature( Feature );
                        this.core.layers[layer_key].data.push(Feature);
                        return this.core;
                    },
                    InsertFromLineString:function(layer_key, coordinates, properties, style){
                        const c_coordinate = []
                        for(let i =0;i<coordinates.length;i+=2){
                            const coordinate=ol.proj.transform([coordinates[i], coordinates[i+1]], 'EPSG:4326', 'EPSG:3857');
                            c_coordinate.push(coordinate);
                        }
                        const LineString = new ol.geom.LineString(c_coordinate);
                        const Feature = new ol.Feature(LineString);
                        properties.featureType = "LineString";
                        properties.coordinates = coordinates;
                        Feature.properties = properties;
                        Feature.hidden = false;
                        this.SetStyle(Feature, style);
                        const layer = this.core.Layer.Load(layer_key);
                        layer.getSource().addFeature( Feature );
                        this.core.layers[layer_key].data.push(Feature);
                        return this.core;
                    },
                    InsertFromGeoJSON:function(){
                        alert("Not at supported.");
                    },
                    CreateProperties:function(information, click, thumbnail){
                        return {
                            information:information,
                            clickEvent:click,
                            thumbnail:thumbnail
                        };
                    },
                    Remove:function(layer_key, feature){
                        const data = this.FindIndex(layer_key, feature);
                        if(data){
                            this.core.Layer.Load(layer_key).getSource().removeFeature(feature);
                            delete this.core.layers[layer_key].data[data];
                        }
                        return this.core;
                    },
                    Hide:function(feature){
                        feature.hidden = true;
                        feature.setStyle(feature.getStyle());
                    },
                    Show:function(feature){
                        feature.hidden = false;
                        feature.setStyle(feature.getStyle());
                    },
                    SetStyle:function(feature, style){
                        function Stylefunction (feature, resolution) {
                            if (feature.hidden)
                               return;
                            return style;
                        }
                        feature.setStyle(Stylefunction);
                    },
                    FindAllByValue: function(layer_key, key, value){
                        const layer = this.core.layers[layer_key];
                        let data = [];
                        for(let idx in layer.data){
                            if(layer.data[idx].properties[key]===value){
                                data.push(layer.data[idx]);
                            }
                        }
                        return data;
                    },
                    FindIndex:function(layer_key, feature){
                        const layer = this.core.layers[layer_key];
                        for(let idx in layer.data){
                            if(layer.data[idx]===feature){
                                return idx;
                            }
                        }
                        return null;
                    },
                    FindFeature:function(layer_key, feature){
                        const idx = this.FindIndex(layer_key, feature);
                        if(idx){
                            return this.core.layers[layer_key].data[idx];
                        }
                        return null;
                    },
                },
                Layer:{
                    core:null,
                    Add:function(key){
                        if(!(key in this.core.layers)){
                            const vectorSource =new ol.source.Vector({
                                format: new ol.format.GeoJSON()
                            });
                            const layer = new ol.layer.Vector({
                                source: vectorSource
                            });
                            this.core.map.addLayer(layer);
                            this.core.layers[key] = {
                                layer:layer,
                                data:[]
                            };
                        }
                        return this;
                    },
                    Load:function(key){
                        if(key in this.core.layers) return this.core.layers[key].layer;
                        return this.Add(key).Load(key);
                    },
                    Find:function(layer){
                        for(let key in this.core.layers){
                            if(this.core.layers[key].layer===layer){
                                return key;
                            }
                        }
                        return null;
                    },
                    RemoveFromLayer:function(layer){
                        const key = this.Find(layer);
                        if(key) this.RemoveFromKey(key);
                        return this;
                    },
                    RemoveFromKey:function(key){
                        const layer = this.Load(key);
                        this.core.map.removeLayer(layer);
                        delete this.core.layers[key];
                        return this;
                    }
                }
            };
        }
    )
);