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
            if($.jsList){
                return;
            }
            let instance_counter = 0;
            $.jsList = {
                /**
                 * 현재 js 파일의 버전을 표시합니다.
                 * @name $.jsList.version
                 */
                version : '0.0.1-alpha'
            }
            $.jsList.create = function (el){
                let tmp = new $.jsList.core(++instance_counter);
                $(el).data('jsList', tmp);
                tmp.init(el);
                return tmp;
            };
            $.jsList.core = function(id){
                this._id = id;
                return this;
            };
            $.jsList.core.prototype = {
                init : function(){

                    this._item = {};

                    const div = document.createElement("div");
                    const div_background = document.createElement("div");
                    const div_search = document.createElement("div");
                    const div_list = document.createElement("div");
                    const div_close = document.createElement("div");
                    const div_no_item = document.createElement("div");
                    const input_search = document.createElement("input");
                    const self = this;

                    div_search.appendChild(input_search);
                    div.appendChild(div_background);
                    div.appendChild(div_search);
                    div.appendChild(div_list);
                    div.appendChild(div_close);
                    div.appendChild(div_no_item);

                    div.style.width = "100vw";
                    div.style.height = "100vh";
                    div.style.position = "fixed";
                    div.style.top = "0px";
                    div.style.left = "0px";
                    div.className = "jsList-hide";

                    div_background.style.width = "100%";
                    div_background.style.height = "100%";
                    div_background.style.position = "absolute";
                    div_background.style.top = "0px";
                    div_background.style.left = "0px";
                    div_background.style.backgroundColor = "rgba(0,0,0,0.6)";
                    
                    div_search.style.width = "360px";
                    div_search.style.height = "30px";
                    div_search.style.position = "absolute";
                    div_search.style.top = "80px";
                    div_search.style.left = "calc(50% - 180px)";
                    div_search.style.textAlign = "center";

                    div_list.style.width = "calc(100% - 20px)";
                    div_list.style.height = "calc(100% - 240px)";
                    div_list.style.position = "absolute";
                    div_list.style.top = "140px";
                    div_list.style.left = "0px";
                    div_list.style.display = "flex";
                    div_list.style.flexDirection = "column";
                    div_list.style.padding = "10px";
                    div_list.style.overflowY = "auto";

                    div_no_item.style.width = "100px";
                    div_no_item.style.height = "20px";
                    div_no_item.style.position = "absolute";
                    div_no_item.style.top = "calc(50% - 10px)";
                    div_no_item.style.left = "calc(50% - 50px)";
                    div_no_item.style.textAlign = "center";
                    div_no_item.style.fontSize = "20px";
                    div_no_item.style.color = "white";
                    div_no_item.style.cursor = "no-drop";
                    div_no_item.innerText = "No Data";

                    div_close.style.width = "60px";
                    div_close.style.height = "60px";
                    div_close.style.position = "absolute";
                    div_close.style.bottom = "10px";
                    div_close.style.left = "calc(50% - 30px)";
                    div_close.style.borderRadius = "60px";
                    div_close.className = "jsList-hover";
                    div_close.innerHTML = "<img src='./static/images/close.png' width=60px height=60px>";
                    div_close.onclick = function(){
                        self.hide();
                    };

                    input_search.setAttribute("type", "text");
                    input_search.style.width = "310px";
                    input_search.style.height = "20px";
                    input_search.style.borderRadius = "100px";
                    input_search.style.paddingLeft = "20px";
                    input_search.style.paddingRight = "20px";
                    input_search.setAttribute("placeholder", "검색어를 입력하세요.");
                    input_search.onkeyup = function(){
                        const text = input_search.value;
                        self.findAll(text);
                    }

                    this._div = div;
                    this._div_search = div_search;
                    this._div_list = div_list;
                    this._input_search = input_search;
                    this._div_no_item = div_no_item;

                    document.getElementsByTagName("BODY")[0].appendChild(div);
                    return this;
                },
                hide : function(){
                    const self = this;
                    this._div.className = this._div.className.replace("jsList-hide", "") + " jsList-hide-animation";
                    setTimeout(function(){
                        self._div.className = self._div.className.replace(" jsList-hide-animation", "") + " jsList-hide";
                    },499);
                    return this;
                },
                show : function(){
                    const self = this;
                    this._div.className = this._div.className.replace("jsList-hide", "") + " jsList-show-animation";
                    setTimeout(function(){
                        self._div.className = self._div.className.replace(" jsList-show-animation", "");
                    },499);
                    return this;
                },
                appendNode : function(node){
                    const text = this._input_search.value;
                    this._item[node._id] = node;
                    this._div_list.appendChild(node._div);
                    this.findAll(text);
                    return this;
                },
                removeNode : function(node){
                    this._div_list.removeChild(node._div);
                    delete this._item[node.id];
                },
                findAll : function(text){
                    let count = 0;
                    for(key in this._item){
                        if(this._item[key].find(text)){
                            count += 1;
                        }
                    }
                    if(count == 0){
                        this._div_no_item.className="";
                    }else{
                        this._div_no_item.className="jsList-hide";
                    }
                }
            };
            let node_instance_counter = 0;
            $.jsList.node = function(el, title, context, image){
                let tmp = new $.jsList._node(++node_instance_counter);
                $(el).data('jsList-Node', tmp);
                tmp.init(el, title, context, image);
                return tmp;
            }
            $.jsList._node = function(id){
                this._id = id;
                return this;
            };
            $.jsList._node.prototype = {
                init : function(title, context, image, properties){
                    this._title = title,
                    this._context = context;
                    this._image = image;
                    this.properties = properties;

                    const div = document.createElement("div");
                    const div_title = document.createElement("div");
                    const div_context = document.createElement("div");
                    const img_image = document.createElement("img");
                    
                    div_title.innerText = title;
                    div_context.innerText = context;
                    if(image){
                        img_image.setAttribute("src", image);
                    }else{
                        img_image.setAttribute("src", "./static/images/search.png");
                    }
                    
                    div.style.position = "relative";
                    div.style.width = "100%";
                    div.style.height = "60px";
                    div.style.backgroundColor = "rgba(0,0,0,0.5)";
                    div.style.marginBottom = "10px";
                    div.style.cursor = "pointer";

                    div_title.style.position = "absolute";
                    div_title.style.left = "80px";
                    div_title.style.top = "0px";
                    div_title.style.width = "calc(100% - 80px)";
                    div_title.style.height = "20px";
                    div_title.style.fontSize = "20px";
                    div_title.style.color = "white";

                    div_context.style.position = "absolute";
                    div_context.style.left = "80px";
                    div_context.style.top = "24px";
                    div_context.style.width = "calc(100% - 95px)";
                    div_context.style.height = "36px";
                    div_context.style.overflowY = "auto";
                    div_context.style.color = "white";

                    img_image.position = "absolute";
                    img_image.style.left = "0px";
                    img_image.style.top = "0px";
                    img_image.style.width = "60px";
                    img_image.style.height = "60px";

                    div.appendChild(div_title);
                    div.appendChild(div_context);
                    div.appendChild(img_image);

                    this._div = div;
                    this._div_title = div_title;
                    this._div_context = div_context;
                    this._img_image = img_image;
                    this._title = title;
                    this._context = context;
                    this._image = image;

                    this._div.className  = "jsList-node-hover";

                    return this;
                },
                setTitle : function(title){
                    this._title=title;
                    this._div_title.innerText = title;
                },
                setContext : function(context){
                    this._context=context;
                    this._div_context.innerText = context;
                },
                hide : function(){
                    this._div.className = this._div.className.replace("jsList-hide", "") + " jsList-hide";
                    return this;
                },
                show : function(){
                    this._div.className = this._div.className.replace("jsList-hide", "");
                    return this;
                },
                find : function(text){
                    if(this._title.indexOf(text)!=-1){
                        this.show();
                    }else if(this._context.indexOf(text)!=-1){
                        this.show();
                    }else{
                        this.hide();
                        return null;
                    }
                    return this;
                },
                bind : function(handle, event){
                    const obj = this;
                    $(this._div).bind(handle, {
                        node:obj
                    }, event);
                    return this;
                }
            }
        }
    )
)