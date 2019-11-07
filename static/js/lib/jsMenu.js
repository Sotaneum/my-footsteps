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
            if($.jsMenu){
                return;
            }
            let instance_counter = 0;
            let item_instance_counter = 0;
            $.jsMenu = {
                 /**
                 * 현재 js 파일의 버전을 표시합니다.
                 * @name $.jsMenu.version
                 */
                version : '0.0.1-alpha',
                item : {
                    create : function(icon, text, event){
                        return new $.jsMenu.item.init(++item_instance_counter, icon, text, event);
                    },                    
                    init : function(id, icon, text, event){
                        this._id = id;
                        this._event = event;
                        const div_frame = document.createElement("div");
                        const img_icon = document.createElement("img");
                        const label_text = document.createElement("label");
                        if(icon){
                            img_icon.setAttribute("src", icon);
                        }
                        label_text.innerText = text;
                        div_frame.appendChild(img_icon);
                        div_frame.appendChild(label_text);
                        this._div_frame = div_frame;
                        if(event){
                            this._div_frame.onclick = event;
                        }
                        this._img_icon = img_icon;
                        this._label_text = label_text;
                        this.setParent = function(parent){
                            const event = this._event;
                            this._div_frame.onclick = function(e){
                                parent.setHide();
                                if(event){
                                    event(e);
                                }
                            }
                            return this;
                        };
                        this.setWidth = function(width){
                            this._div_frame.style.width = width + "px";
                            return this;
                        };
                        this.setHeight = function(height){
                            this._div_frame.style.height = height + "px";
                            return this;
                        };
                        this.setThema = function(thema){
                            const prev = "jsmenu-button-style-";
                            this._div_frame.className = prev + thema;
                            return this;
                        }
                        return this;
                    }
                }
            };
            $.jsMenu.create = function (el, target){
                let tmp = new $.jsMenu.core(++instance_counter);
                $(el).data('jsMenu', tmp);
                tmp.init(el, target);
                return tmp;
            };
            $.jsMenu.core = function(id){
                this._id = id;
                return this;
            };
            $.jsMenu.core.prototype = {
                init : function(target){
                    this._thema = "default";
                    this._div = document.createElement("div");
                    this._div_frame = document.createElement("div");
                    this._div_background = document.createElement("div");
                    
                    this._div.className = "jsmenu-core jsmenu-hide";
                    this._div_frame.className = "jsmenu-frame";
                    this._div_background.className = "jsmenu-background";

                    const self = this;
                    this._div_background.onclick = function(){
                        self.setHide();
                    };

                    this._div.appendChild(this._div_background);
                    this._div.appendChild(this._div_frame);
                    target.appendChild(this._div);

                    this._item = {};
                    return this.setThema(this._thema);
                },
                setThema : function(thema){
                    const prev = "jsmenu-frame-style-";
                    this._div_frame.className = this._div_frame.className.replace(prev+this._thema, "") + " " + prev+thema;
                    for(let key in this._item){
                        this._item[key].setThema(thema);
                    }
                    this._thema = thema;
                    return this;
                },
                setWidth : function(width){
                    this._div_frame.style.width = width + "px";
                    this._div_frame.style.left = "calc(50% - " + ((width + 4) / 2) + "px)";
                    return this;
                },
                setHeight : function(height){
                    this._div_frame.style.height = height + "px";
                    this._div_frame.style.top = "calc(50% - " + ((height + 4) / 2) + "px)";
                    return this;
                },
                setBackgroundColor : function(color){
                    this._div_frame.style.backgroundColor = color;
                    return this;
                },
                setHide : function(){
                    const self = this;
                    this._div.className = this._div.className.replace("jsmenu-hide", "") + " jsmenu-hide-animation";
                    setTimeout(function(){
                        self._div.className = self._div.className.replace("jsmenu-hide-animation", "") + " jsmenu-hide";
                    },499);
                    return this;
                },
                setShow : function(){
                    const self = this;
                    this._div.className = this._div.className.replace("jsmenu-hide", "") + " jsmenu-show-animation";
                    setTimeout(function(){
                        self._div.className = self._div.className.replace("jsmenu-show-animation", "");
                    },499);
                    return this;
                },
                addItem : function(item){
                    item.setThema(this._thema).setParent(this);
                    this._item[item._id] = item;
                    this._div_frame.appendChild(item._div_frame);
                    return this;
                },
                removeItem : function(id){
                    const item = this._item[id];
                    if(item){
                        this._div_frame.removeChild(item._div_frame);
                        delete this._item[id];
                    }
                    return this;
                }
            };            
        }
    )
);