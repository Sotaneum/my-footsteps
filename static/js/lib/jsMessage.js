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
            if($.jsmessage){
                return;
            }
            let instance_counter = 0;
            
            $.jsmessage = {
                /**
                 * 현재 js 파일의 버전을 표시합니다.
                 * @name $.jsmessage.version
                 */
                version : '0.0.1-alpha'
            };
            $.jsmessage.image = { 
                default : "data:image/png;base64,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"
            };
            $.jsmessage.html = {
                frame : {
                    default : function(image_src, bottom_text, middle_text){
                        return "<img src='"+image_src+"'><div class='bottom'>"+bottom_text+"</div><div class='middle'>"+middle_text+"</div>";
                    }
                },
                label : {
                    default : function(text){
                        return text;
                    }
                }
            };
            $.jsmessage.style = {
                frame : {
                    BottomUp:"jsmessage-frame-animation-bottom-up",
                    UpBottom:"jsmessage-frame-animation-up-bottom",
                    Bottom:"jsmessage-frame-no-animation-bottom",
                    Up:"jsmessage-frame-no-animation-up"
                },
                label : {
                    BottomUp:"jsmessage-label-animation-bottom-up",
                    UpBottom:"jsmessage-label-animation-up-bottom",
                    Bottom:"jsmessage-label-no-animation-bottom",
                    Up:"jsmessage-label-no-animation-up"
                }
            };
            $.jsmessage.create = function (el, html, style){
                var tmp = new $.jsmessage.core(++instance_counter);
                $(el).data('jsmessage', tmp);
                tmp.init(el, html, style);
                return tmp;
            };
            $.jsmessage.core = function(id){
                this._id = id;
                return this;
            };
            $.jsmessage.core.prototype = {
                init : function(html, style){
                    const TYPE = style.split("-")[1];
                    this._div = document.createElement("div");
                    this._div.innerHTML = html;
                    this._div.className = "jsmessage-"+TYPE+" " + style;
                    return this;
                },
                setHTML : function(html){
                    this._div.innerHTML = html;
                    return this;
                },
                setStyle : function(style){
                    const TYPE = style.split("-")[1];
                    this._div.className = "jsmessage-"+TYPE+" " + style;
                    return this;
                },
                addIn : function(PARENT_ELEMENT, TIME){
                    const MESSAGE = this._div;                    
                    PARENT_ELEMENT.appendChild(MESSAGE);
                    if(TIME > 0){
                        setTimeout(function(){
                            PARENT_ELEMENT.removeChild(MESSAGE);
                        }, TIME);
                    }
                    return this;
                },
                bind : function(handle, event){
                    $(this._div).bind(handle, event);
                    return this;
                }
            };
        }
    )
);