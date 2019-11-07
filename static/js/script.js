/*
////////////////////////////////////////////////////////////////////
// Statistics 0.1.0.alpha                                         //
// Copyright 2019 Lee Dong Gun (https://github.com/Sotaneum)      //
//                                                                //
// Creation Date : 2019.10.27                                     //
////////////////////////////////////////////////////////////////////
*/

/*
////////////////////////////////////////////////////////////////////
// VARIABLE
////////////////////////////////////////////////////////////////////
*/
const DIV_MESSAGE = document.getElementById("js-message");
const DIV_BTN_MENU = document.getElementById("js-btn-menu");
const DIV_MENU = document.getElementById("js-menu");

const DIV_OL_MAP = document.getElementById("js-map");
const DIV_OL_POPUP = document.getElementById("js-popup");
const DIV_OL_POPUP_CLOSER = document.getElementById("js-popup-closer");
const DIV_OL_POPUP_CONTENT = document.getElementById("js-popup-content");

const MESSAGE_POSITION_HTML = $.jsmessage.html.label.default("Loading");
const MESSAGE_POSITION = $.jsmessage.create(MESSAGE_POSITION_HTML, $.jsmessage.style.label.Bottom).addIn(DIV_MESSAGE, 0);;

const OPENLAYERS_OPTION = {
    target: DIV_OL_MAP,
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                attributions: ['Powered by Esri'],
                attributionsCollapsible: false,
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                
        })})],
    view: new ol.View({
        center: ol.proj.fromLonLat([126.682121, 35.945291]),
        zoom: 16,
        maxZoom:17/*,
        minZoom:13*/
    })
};

const LIST = $.jsList.create();
const OLEXT = $.jsolext.create(OPENLAYERS_OPTION);
const MENU = $.jsMenu.create(DIV_MENU).setWidth(360).setHeight(100);
const ADD_MENU = $.jsMenu.create(DIV_MENU).setWidth(240).setHeight(100);

const MENU_ADD_POST = $.jsMenu.item.create("./static/images/add.png","추가",function(){
    ADD_MENU.setShow();
}).setWidth(90).setHeight(100);

const MENU_THEMA_MAP = $.jsMenu.item.create("./static/images/search.png","나 찾기",function(){
    OLEXT.moveCenter(me);
}).setWidth(90).setHeight(100);

const MENU_POST_LIST = $.jsMenu.item.create("./static/images/list.png","목록",function(){
    LIST.show();
}).setWidth(90).setHeight(100);

const MENU_CLOSE = $.jsMenu.item.create("./static/images/close.png","닫기",null).setWidth(90).setHeight(100);

const MENU_ADD_POST_FROM_MAP = $.jsMenu.item.create("./static/images/map.png","맵에서 선택",function(){notice("곧 선보이겠습니다.",3000);}).setWidth(90).setHeight(100);

const MENU_ADD_POST_FROM_TEXT = $.jsMenu.item.create("./static/images/text.png","직접 입력",function(){
    
}).setWidth(90).setHeight(100);

const MENU_ADD_POST_CLOSE = $.jsMenu.item.create("./static/images/close.png","닫기",null).setWidth(90).setHeight(100);

MENU.addItem(MENU_ADD_POST).addItem(MENU_THEMA_MAP).addItem(MENU_POST_LIST).addItem(MENU_CLOSE);
ADD_MENU.addItem(MENU_ADD_POST_FROM_MAP).addItem(MENU_ADD_POST_FROM_TEXT).addItem(MENU_ADD_POST_CLOSE);

DIV_BTN_MENU.onclick = function(){
    MENU.setShow();
};

OLEXT.Style.addColor("red","rgba(255,0,0,0.6)");
OLEXT.Style.addIcon("red-point","./static/images/point.png",[30,30],0.8,0.5);

let data_id = 0;
let data = {};
let me = null;
/*
////////////////////////////////////////////////////////////////////
// FUNCTION
////////////////////////////////////////////////////////////////////
*/

function HandleOpenLayersHover(e){
    const PIXEL = OLEXT.getEventPixel(e);
    const COOR = OLEXT.CoordinateFromPixel(PIXEL);
    const HTML = $.jsmessage.html.label.default(COOR[0] + ", " + COOR[1]);
    MESSAGE_POSITION.setHTML(HTML);
}

function coordinatesToText(coordinates){
    if (coordinates.length<2){
        return "";
    }
    else if (coordinates.length==2){
        return coordinates[0] +", "+coordinates[1];
    }
    const start_coord = [coordinates[0].toFixed(5),coordinates[1].toFixed(5)];
    const end_coord = [coordinates[coordinates.length-2].toFixed(5),coordinates[coordinates.length-1].toFixed(5)];
    return start_coord[0] +", "+start_coord[1] + " -> " + end_coord[0] +", "+end_coord[1];
}

function HandleOpenLayersClick(e){
    const pixel = OLEXT.getEventPixel(e);
    const feature = OLEXT.forEachFeatureAtPixel(pixel, function (feature, layer) {
        return feature;
    });
    const coordinate = OLEXT.CoordinateFromPixel(pixel);
    let thumbnail = $.jsmessage.image.default;
    let text = "정보없음";
    let event = function(){/* nothing */};
    let bottom = coordinatesToText(coordinate);
    if(feature){
        const properties = feature.properties;
        const propType = (properties.featureType)?properties.featureType+"<br>":"";
        const propInfo = (properties.information)?properties.information:text;
        const propCoor = (properties.coordinates)?properties.coordinates:coordinate;
        const propClick = (properties.clickEvent)?properties.clickEvent:event;
        const propthumb = (properties.thumbnail)?properties.thumbnail:thumbnail;
        
        text = propType + propInfo;
        bottom = coordinatesToText(propCoor);
        event = propClick;
        thumbnail = propthumb;
    }
    const html = $.jsmessage.html.frame.default(thumbnail, bottom, text);
    const style = $.jsmessage.style.frame.BottomUp;
    $.jsmessage.create(html, style).bind("click",event).addIn(DIV_MESSAGE, 6000);
    
}

function OpenLayersInit(){
    const WIDTH = window.innerWidth;
    const HANDLE = (WIDTH < 500)? "click" : "dblclick";
    OLEXT.DisableDoubleClickZoom().addEvent("pointermove", HandleOpenLayersHover).addEvent(HANDLE, HandleOpenLayersClick);
}

function notice(context, msec){
    const html = $.jsmessage.html.frame.default("./static/images/close.png", "공지", context);
    const style = $.jsmessage.style.frame.BottomUp;
    $.jsmessage.create(html, style).bind("click",event).addIn(DIV_MESSAGE, msec);
}

function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            const loc = position.coords;
            const coords = [loc.longitude,loc.latitude];
            me = coords;
            const event = function(json){
                const address = json.display_name;
                const properties = OLEXT.Feature.CreateProperties(address);
                const style = OLEXT.Style["red-point"];
                OLEXT.Layer.RemoveFromKey("user_position");
                OLEXT.Feature.InsertFromPoint("user_position", coords, properties, style);
            };
            
            reverseGeocode(coords, event);
        },function(){
            notice("사용자의 위치를 가져오지 못했습니다.",3000);
        },{
            enableHighAccuracy: true,
            maximumAge: 1,
            timeout: Infinity
        });
    } else {
        notice("사용자의 위치를 가져오지 못했습니다.",3000);
    }
}

function reverseGeocode(coords, event) {
    fetch('http://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1])
    .then(function(response) {
        return response.json();
    }).then(function(json) {
        event(json);
    });
 };

function add_data(location, title, context, image){
    const click_event = function(e){
        const node = e.data.node;
        LIST.hide();
        OLEXT.moveCenter([node.properties.location[0],node.properties.location[1]]);
    }
    const event = function(json){
        const address = json.display_name;
        const node = $.jsList.node(title, context + " (" + address + ")",image, {
            address:address,
            location:location,
            title:title,
            context:context,
        });
        const feature_style = OLEXT.Style.red;
        const feature_prop = OLEXT.Feature.CreateProperties(context, null, image);
        node.bind("click", click_event);
        OLEXT.Feature.InsertFromPolygon("data", location, feature_prop, feature_style);
        let item = {
            address:address,
            location:location,
            title:title,
            context:context,
            image:image,
            node:node
        };
        data[++data_id] = item;
        LIST.appendNode(node);
        
    };
    reverseGeocode(location, event);
}

function remove_data(){

}

function find_data(){

}

function default_data(){
    
    add_data([126.68257713, 35.94544110,126.68316722, 35.94536293,126.68307066, 35.94458989,126.68254495, 35.94464200,126.68257713, 35.94544110],"디지털 정보관","수업듣는 곳",null);
    add_data([126.68534517, 35.94750830, 126.68577433, 35.94753435, 126.68569922, 35.94716956, 126.68539882, 35.94710007, 126.68534517, 35.94750830],"맘스터치","싸이버거 맛있다.",null);
    add_data([126.68689013, 35.94878507, 126.68716908, 35.94873295, 126.68716908, 35.94863741, 126.68687940, 35.94862873, 126.68689013, 35.94878507],"집","가기 전에 마트 들릴 것",null);
    add_data([126.68929338, 35.94503287, 126.69018388, 35.94483309, 126.69003367, 35.94465069, 126.68971181, 35.94484178, 126.68929338, 35.94503287],"KB국민은행 ATM","국민은행 ATM기계 있다.",null);
    add_data([126.68697596, 35.94626625, 126.68737292, 35.94630968, 126.68706179, 35.94700453, 126.68690085, 35.94697847, 126.68697596, 35.94626625],"마트","달걀, 파 사야함.",null);
    add_data([126.68303847, 35.94623151, 126.68358564, 35.94613596, 126.68357491, 35.94633573, 126.68311357, 35.94634442, 126.68303847, 35.94623151],"도서관","미리 앱 켜서 확인증 사용해야 함.",null);
}

/*
////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////
*/

OpenLayersInit();
getLocation();
default_data();