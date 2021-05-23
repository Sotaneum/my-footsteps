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
const DIV_EDITBOX = document.getElementById("js-editbox");

const DIV_OL_MAP = document.getElementById("js-map");
const DIV_OL_POPUP = document.getElementById("js-popup");
const DIV_OL_POPUP_CLOSER = document.getElementById("js-popup-closer");
const DIV_OL_POPUP_CONTENT = document.getElementById("js-popup-content");

const MESSAGE_POSITION_HTML = $.jsmessage.html.label.default("Loading");
const MESSAGE_POSITION = $.jsmessage
  .create(MESSAGE_POSITION_HTML, $.jsmessage.style.label.Bottom)
  .addIn(DIV_MESSAGE, 0);

const OPENLAYERS_OPTION = {
  target: DIV_OL_MAP,
  layers: [
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        attributions: ["Powered by Esri"],
        attributionsCollapsible: false,
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([126.682121, 35.945291]),
    zoom: 16,
    maxZoom: 17 /*,
        minZoom:13*/,
  }),
};

const LIST = $.jsList.create();
const OLEXT = $.jsolext.create(OPENLAYERS_OPTION);
const MENU = $.jsMenu.create(DIV_MENU).setWidth(360).setHeight(100);
const ADD_MENU = $.jsMenu.create(DIV_MENU).setWidth(160).setHeight(100);

const MENU_ADD_POST = $.jsMenu.item
  .create("./static/images/add.png", "메모", function () {
    ADD_MENU.setShow();
  })
  .setWidth(90)
  .setHeight(100);

const MENU_THEMA_MAP = $.jsMenu.item
  .create("./static/images/search.png", "나 찾기", function () {
    OLEXT.moveCenter(me);
  })
  .setWidth(90)
  .setHeight(100);

const MENU_POST_LIST = $.jsMenu.item
  .create("./static/images/list.png", "목록", function () {
    LIST.show();
  })
  .setWidth(90)
  .setHeight(100);

const MENU_CLOSE = $.jsMenu.item
  .create("./static/images/close.png", "닫기", null)
  .setWidth(90)
  .setHeight(100);

const CLOSEMODIFYMODE = function (element) {
  OLEXT.stopModify();
  element.setText("추가/수정");
  element.setEvent(function () {
    SETMODIFYMODE(element);
  });
};

const SETMODIFYMODE = function (element) {
  OLEXT.startModify("data");
  element.setText("해제");
  element.setEvent(function () {
    CLOSEMODIFYMODE(element);
  });
};

const DELETEMODE = function (element) {};

const MENU_ADD_POST_FROM_MAP = $.jsMenu.item
  .create("./static/images/map.png", "추가/수정", function () {
    SETMODIFYMODE(MENU_ADD_POST_FROM_MAP);
  })
  .setWidth(90)
  .setHeight(100);

const MENU_ADD_POST_FROM_TEXT = $.jsMenu.item
  .create("./static/images/text.png", "삭제", function () {})
  .setWidth(90)
  .setHeight(100);

const MENU_ADD_POST_CLOSE = $.jsMenu.item
  .create("./static/images/close.png", "닫기", null)
  .setWidth(90)
  .setHeight(100);

MENU.addItem(MENU_ADD_POST)
  .addItem(MENU_THEMA_MAP)
  .addItem(MENU_POST_LIST)
  .addItem(MENU_CLOSE);
ADD_MENU.addItem(MENU_ADD_POST_FROM_MAP).addItem(MENU_ADD_POST_CLOSE);

DIV_BTN_MENU.onclick = function () {
  MENU.setShow();
};

OLEXT.Style.addColor("red", "rgba(255,0,0,0.6)");
OLEXT.Style.addIcon(
  "red-point",
  "./static/images/point.png",
  [30, 30],
  0.8,
  0.5
);

let data_id = 0;
let data = {};
let me = null;
/*
////////////////////////////////////////////////////////////////////
// FUNCTION
////////////////////////////////////////////////////////////////////
*/

function HandleOpenLayersHover(e) {
  const PIXEL = OLEXT.getEventPixel(e);
  const COOR = OLEXT.CoordinateFromPixel(PIXEL);
  const HTML = $.jsmessage.html.label.default(COOR[0] + ", " + COOR[1]);
  MESSAGE_POSITION.setHTML(HTML);
}

function coordinatesToText(coordinates) {
  if (coordinates.length < 2) {
    return "";
  } else if (coordinates.length == 2) {
    return coordinates[0] + ", " + coordinates[1];
  }
  const start_coord = [coordinates[0].toFixed(5), coordinates[1].toFixed(5)];
  const end_coord = [
    coordinates[coordinates.length - 2].toFixed(5),
    coordinates[coordinates.length - 1].toFixed(5),
  ];
  return (
    start_coord[0] +
    ", " +
    start_coord[1] +
    " -> " +
    end_coord[0] +
    ", " +
    end_coord[1]
  );
}

function HandleOpenLayersClick(e) {
  const pixel = OLEXT.getEventPixel(e);
  const feature = OLEXT.forEachFeatureAtPixel(pixel, function (feature, layer) {
    return feature;
  });
  const coordinate = OLEXT.CoordinateFromPixel(pixel);
  let thumbnail = $.jsmessage.image.default;
  let text = "정보없음";
  let event = function () {
    /*nothing*/
  };
  let bottom = coordinatesToText(coordinate);
  if (feature) {
    const properties = feature.properties;
    if (properties) {
      const propType = properties.featureType
        ? properties.featureType + "<br>"
        : "";
      const propInfo = properties.information ? properties.information : text;
      const propCoor = properties.coordinates
        ? properties.coordinates
        : coordinate;
      const propClick = properties.clickEvent ? properties.clickEvent : event;
      const propthumb = properties.thumbnail ? properties.thumbnail : thumbnail;

      text = propType + propInfo;
      bottom = coordinatesToText(propCoor);
      event = propClick;
      thumbnail = propthumb;
    } else {
      EditItemFromFeature(feature);
      //OLEXT.Feature.Remove("data", feature);
      //OLEXT.Feature.SetStyle(feature, OLEXT.Style.red);
      //console.log(feature);

      return;
    }
  }
  const html = $.jsmessage.html.frame.default(thumbnail, bottom, text);
  const style = $.jsmessage.style.frame.BottomUp;
  $.jsmessage.create(html, style).bind("click", event).addIn(DIV_MESSAGE, 6000);
}

function OpenLayersInit() {
  const WIDTH = window.innerWidth;
  const HANDLE = WIDTH < 500 ? "click" : "dblclick";
  OLEXT.DisableDoubleClickZoom()
    .addEvent("pointermove", HandleOpenLayersHover)
    .addEvent(HANDLE, HandleOpenLayersClick);
}

function notice(context, msec) {
  const html = $.jsmessage.html.frame.default(
    "./static/images/close.png",
    "공지",
    context
  );
  const style = $.jsmessage.style.frame.BottomUp;
  $.jsmessage.create(html, style).bind("click", event).addIn(DIV_MESSAGE, msec);
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      function (position) {
        const loc = position.coords;
        const coords = [loc.longitude, loc.latitude];
        me = coords;
        const event = function (json) {
          const address = json.display_name;
          const properties = OLEXT.Feature.CreateProperties(address);
          const style = OLEXT.Style["red-point"];
          OLEXT.Layer.RemoveFromKey("user_position");
          OLEXT.Feature.InsertFromPoint(
            "user_position",
            coords,
            properties,
            style
          );
        };

        reverseGeocode(coords, event);
      },
      function () {
        notice("사용자의 위치를 가져오지 못했습니다.", 3000);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1,
        timeout: Infinity,
      }
    );
  } else {
    notice("사용자의 위치를 가져오지 못했습니다.", 3000);
  }
}

function reverseGeocode(coords, event) {
  fetch(
    "https://nominatim.openstreetmap.org/reverse?format=json&lon=" +
      coords[0] +
      "&lat=" +
      coords[1]
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      event(json);
    });
}

function add_data(location, title, context, image, callback) {
  const click_event = function (e) {
    const node = e.data.node;
    LIST.hide();
    OLEXT.moveCenter([
      node.properties.location[0],
      node.properties.location[1],
    ]);
  };
  const event = function (json) {
    const message_click = function () {
      EditItemFromFeature(feature);
    };
    const address = json.display_name;
    const feature_style = OLEXT.Style.red;
    const feature_prop = OLEXT.Feature.CreateProperties(
      context,
      message_click,
      image
    );
    const feature = OLEXT.Feature.InsertFromPolygon(
      "data",
      location,
      feature_prop,
      feature_style
    );
    const node = $.jsList
      .node(title, context + " (" + address + ")", image, {
        address: address,
        location: location,
        title: title,
        context: context,
        feature: feature,
      })
      .bind("click", click_event);
    let item = {
      address: address,
      location: location,
      title: title,
      context: context,
      image: image,
      node: node,
      feature: feature,
    };
    data[++data_id] = item;
    LIST.appendNode(node);
    if (callback) callback();
  };
  reverseGeocode(location, event);
}

function modify_data(item, title, context) {
  item.node.setTitle(title);
  item.node.setContext(context + " (" + item.address + ")");
  item.feature.properties.information = context;
  item.title = title;
  item.context = context;
}

function remove_data(feature) {
  const key = find_data(feature);
  const item = data[key];
  OLEXT.Feature.Remove("data", feature);
  LIST.removeNode(item.node);
  delete data[key];
}

function find_data(feature) {
  for (let key in data) {
    if (data[key].feature === feature) {
      return key;
    }
  }
  return null;
}

function EditItemFromItem(item) {
  if (DIV_EDITBOX.innerHTML == "") {
    const frame = document.createElement("div");
    const div_label = document.createElement("div");
    const title_label = document.createElement("label");
    const context_label = document.createElement("label");
    const div_field = document.createElement("div");
    const title = document.createElement("input");
    const context = document.createElement("input");
    const div_button = document.createElement("div");
    const save_button = document.createElement("input");
    const close_button = document.createElement("input");
    const delete_button = document.createElement("input");

    div_label.appendChild(title_label);
    div_label.appendChild(context_label);

    div_field.appendChild(title);
    div_field.appendChild(context);

    div_button.appendChild(save_button);
    div_button.appendChild(close_button);
    div_button.appendChild(delete_button);

    title.setAttribute("type", "text");
    title.setAttribute("placeholder", "TITLE");
    context.setAttribute("type", "text");
    context.setAttribute("placeholder", "CONTEXT");
    save_button.setAttribute("type", "button");
    close_button.setAttribute("type", "button");
    delete_button.setAttribute("type", "button");

    title.setAttribute("value", item.title);
    context.setAttribute("value", item.context);
    save_button.setAttribute("value", "저장");
    close_button.setAttribute("value", "닫기");
    delete_button.setAttribute("value", "삭제");
    title_label.innerText = "title";
    context_label.innerText = "context";

    frame.style.backgroundColor = "white";
    frame.style.position = "fixed";
    frame.style.width = "300px";
    frame.style.height = "100px";
    frame.style.bottom = "-350px";
    frame.style.left = "calc(50% - 150px)";
    frame.style.borderRadius = "10px";
    frame.style.display = "flex";
    frame.style.flexDirection = "column";
    frame.className = "editbox";

    div_button.style.position = "absolute";
    div_button.style.width = "100%";
    div_button.style.height = "40px";
    div_button.style.bottom = "0px";
    div_button.style.textAlign = "center";

    div_label.style.width = "100%";
    div_label.style.textAlign = "center";
    div_label.style.height = "30px";

    div_field.style.width = "100%";
    div_field.style.textAlign = "center";

    title.style.width = "45%";
    title_label.style.position = "absolute";
    title_label.style.left = "10px";
    title_label.style.top = "10px";
    context.style.width = "45%";
    context_label.style.position = "absolute";
    context_label.style.right = "10px";
    context_label.style.top = "10px";

    save_button.onclick = function () {
      modify_data(item, title.value, context.value);
      notice("변경되었습니다.", 6000);
      $(frame).fadeOut(1);
      setTimeout(function () {
        DIV_EDITBOX.removeChild(frame);
      }, 2);
    };
    close_button.onclick = function () {
      $(frame).fadeOut(500);
      setTimeout(function () {
        DIV_EDITBOX.removeChild(frame);
      }, 999);
    };
    delete_button.onclick = function () {
      remove_data(item.feature);
      $(frame).fadeOut(1);
      notice("삭제되었습니다.", 6000);
      setTimeout(function () {
        DIV_EDITBOX.removeChild(frame);
      }, 2);
    };

    frame.appendChild(div_label);
    frame.appendChild(div_field);
    frame.appendChild(div_button);

    DIV_EDITBOX.appendChild(frame);

    setTimeout(function () {
      frame.style.bottom = "100px";
    }, 2);
  } else {
    notice("열려있는 창을 먼저 닫아주세요.", 6000);
  }
}

function EditItemFromFeature(feature) {
  let key = find_data(feature);
  if (key == null) {
    const coord = OLEXT.CoordinateFromFeature(feature);
    add_data(coord, "", "", null, function () {
      OLEXT.Feature.Remove("data", feature);
      key = data_id;
      EditItemFromItem(data[key]);
    });
  } else {
    EditItemFromItem(data[key]);
  }
  return feature;
}

function default_data() {
  add_data(
    [
      126.68257713, 35.9454411, 126.68316722, 35.94536293, 126.68307066,
      35.94458989, 126.68254495, 35.944642, 126.68257713, 35.9454411,
    ],
    "디지털 정보관",
    "수업듣는 곳",
    null
  );
  add_data(
    [
      126.68534517, 35.9475083, 126.68577433, 35.94753435, 126.68569922,
      35.94716956, 126.68539882, 35.94710007, 126.68534517, 35.9475083,
    ],
    "맘스터치",
    "싸이버거 맛있다.",
    null
  );
  add_data(
    [
      126.68689013, 35.94878507, 126.68716908, 35.94873295, 126.68716908,
      35.94863741, 126.6868794, 35.94862873, 126.68689013, 35.94878507,
    ],
    "집",
    "가기 전에 마트 들릴 것",
    null
  );
  add_data(
    [
      126.68929338, 35.94503287, 126.69018388, 35.94483309, 126.69003367,
      35.94465069, 126.68971181, 35.94484178, 126.68929338, 35.94503287,
    ],
    "KB국민은행 ATM",
    "국민은행 ATM기계 있다.",
    null
  );
  add_data(
    [
      126.68697596, 35.94626625, 126.68737292, 35.94630968, 126.68706179,
      35.94700453, 126.68690085, 35.94697847, 126.68697596, 35.94626625,
    ],
    "마트",
    "달걀, 파 사야함.",
    null
  );
  add_data(
    [
      126.68303847, 35.94623151, 126.68358564, 35.94613596, 126.68357491,
      35.94633573, 126.68311357, 35.94634442, 126.68303847, 35.94623151,
    ],
    "도서관",
    "미리 앱 켜서 확인증 사용해야 함.",
    null
  );
}

/*
////////////////////////////////////////////////////////////////////
// MAIN
////////////////////////////////////////////////////////////////////
*/

OpenLayersInit();
getLocation();
default_data();
