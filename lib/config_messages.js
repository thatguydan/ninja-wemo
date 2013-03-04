exports.probeGreeting = {
  "contents":[
    { "type":"heading",    "text":"Belkin WeMo"},
    { "type": "submit", "name": "Scan", "rpc_method": "configScan" },
    { "type": "submit", "name": "Add Manually", "rpc_method": "manual_get_wemo" },
    { "type": "submit", "name": "Remove Existing", "rpc_method": "manual_show_remove" }

  ]
};

exports.fetchWeMoModal = {
  "contents":[
    { "type":"heading"  ,    "text":"Belkin WeMo"},
    { "type":"paragraph",    "text":"Please enter the host of the Belkin WeMo"},
    { "type":"input_field_text", "field_name": "wemo_host", "value": "", "label": "Host", "placeholder": "10.0.1.5", "required": true},
    { "type":"submit"   ,     "name": "Add", "rpc_method": "manual_set_wemo" }
  ]
};

exports.removeWeMoModal = {
  "contents":[
    { "type":"heading"  ,    "text":"Belkin WeMo"},
    { "type":"paragraph",    "text":"Please choose the WeMo you wish to remove"},
    { "type": "input_field_select", "field_name": "wemo_host", "label": "WeMo IP", "options": [{ "name": "None", "value": "", "selected": true}], "required": false },
    { "type":"submit"   ,    "name": "Delete", "rpc_method": "manual_remove_wemo" }
  ]
};

exports.finish = {
  "finish": true
};