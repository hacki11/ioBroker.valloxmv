/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

// you have to require the utils module and call adapter function
const utils = require('@iobroker/adapter-core'); // Get common adapter utils

// read the adapter name from package.json
const adapterName =  'valloxmv'; // require('./package.json').name.split('.').pop();

const ValloxWebsocket =  require("./lib/valloxWebsocket");
const ValloxStateBridge = require("./lib/valloxStateBridge");

let valloxClient = null;
let valloxStateBridges = null;
/*Variable declaration, since ES6 there are let to declare variables. Let has a more clearer definition where 
it is available then var.The variable is available inside a block and it's childs, but not outside. 
You can define the same variable name inside a child without produce a conflict with the variable of the parent block.*/
let variable = 1234;

let result;
let err;
let url = "";
let timer     = null;
let stopTimer = null;
let isStopping = false;


var sync_milliseconds = 5 * 60 * 1000;  // 5min



// create adapter instance wich will be used for communication with controller
let adapter;
function startAdapter(options) {
	options = options || {};
	Object.assign(options, {
        // name has to be set and has to be equal to adapters folder name and main file name excluding extension
        name: adapterName,
        // is called when adapter shuts down - callback has to be called under any circumstances!
        unload: function (callback) {
            try {
                adapter.log.info('cleaned everything up...');
                callback();
            } catch (e) {
                callback();
            }
        },
        // is called if a subscribed object changes
        objectChange: function (id, obj) {
            // Warning, obj can be null if it was deleted
            adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
        },
        // is called if a subscribed state changes
        stateChange: function (id, state) {
            // Warning, state can be null if it was deleted
            //adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
            
            // Update von Aktualisierung
            //stateChange valloxmv.0.profiles.away.A_CYC_AWAY_AIR_TEMP_TARGET {"val":15,"ack":true,"ts":1554378692864,"q":0,"from":"system.adapter.valloxmv.0","lc":1554378662888}
            // Update von Oberfläche
            //stateChange valloxmv.0.profiles.away.A_CYC_AWAY_SPEED_SETTING {"val":40,"ack":false,"ts":1554378707653,"q":0,"from":"system.adapter.admin.0","lc":1554378707653}
            //valloxmv.0.profiles.away.AIR_TEMP_TARGET
            let h = "";
            h = state.from;
            if(h.indexOf(".valloxmv.") > 0)
            {                
                return;
            }

            
            h = id;
            
            // Find matching Bridge Object 
            for (var key in valloxStateBridges) {    
                var obj =  valloxStateBridges[key];
                var objPath = obj.IoBrokerConfigPath  +'.' +  obj.VlxDevConstant;
                if( h.endsWith( objPath) )
                {
                    const valloxClient = new ValloxWebsocket({ ip: adapter.config.host, port: adapter.config.port });
                        state.val;
                        adapter.log.info('Setting ' + obj.VlxDevConstant +  ' to new value ' + state.val );                        

                        let c = {}                         
                        c[obj.VlxDevConstant] = state.val;
                        valloxClient.setValues(c);                
                }                
            }

            // you can use the ack flag to detect if it is status (true) or command (false)
            if (state && !state.ack) {
                adapter.log.info('ack is not set!');
            }
        },
        // Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
        message: function (obj) {
            if (typeof obj === 'object' && obj.message) {
                if (obj.command === 'send') {
                    // e.g. send email or pushover or whatever
                    console.log('send command');
        
                    // Send response in callback if required
                    if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
                }
            }
        },
        // is called when databases are connected and adapter received configuration.
        // start here!
        ready: () => main()
    });
    // you have to call the adapter function and pass a options object
    // adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
	adapter = new utils.Adapter(options);

	return adapter;
};

function main() {

    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:  
    adapter.log.info('Host: '     + adapter.config.host);
    adapter.log.info('Port: '     + adapter.config.port);
    adapter.log.info('Interval: ' + adapter.config.interval);
    
    initBridge();
    initStates();

    // in this template all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');

    sync_milliseconds =  adapter.config.interval * 1000; // parseFloat(adapter.config.synctime * 1000 * 60);
    adapter.log.info("Sync time set to " + sync_milliseconds + " ms");

    getValloxData();
}


function initBridge()
{

     valloxStateBridges = {};
     let configSection ="";

     configSection = "states"; 
     valloxStateBridges['A_CYC_TEMP_SUPPLY_AIR'] = new ValloxStateBridge( configSection, "A_CYC_TEMP_SUPPLY_AIR", "", "number", "indicator", true  )
     valloxStateBridges['A_CYC_TEMP_OUTDOOR_AIR'] = new ValloxStateBridge( configSection, "A_CYC_TEMP_OUTDOOR_AIR", "", "number", "indicator", true  );
     valloxStateBridges['A_CYC_TEMP_EXHAUST_AIR'] = new ValloxStateBridge( configSection, "A_CYC_TEMP_EXHAUST_AIR", "", "number", "indicator", true  );
     valloxStateBridges['A_CYC_TEMP_EXTRACT_AIR'] = new ValloxStateBridge( configSection, "A_CYC_TEMP_EXTRACT_AIR", "", "number", "indicator", true  );
     valloxStateBridges['A_CYC_TEMP_SUPPLY_CELL_AIR'] = new ValloxStateBridge( configSection, "A_CYC_TEMP_SUPPLY_CELL_AIR", "", "number", "indicator", true  ); 
     
     configSection = "profiles.home";
     valloxStateBridges['A_CYC_HOME_RH_CTRL_ENABLED'] = new ValloxStateBridge( configSection, "A_CYC_HOME_RH_CTRL_ENABLED", "Feuchtigkeitsteuerung aktiv", "boolean", "indicator", true  ); 
     valloxStateBridges['A_CYC_HOME_CO2_CTRL_ENABLED'] = new  ValloxStateBridge( configSection, "A_CYC_HOME_CO2_CTRL_ENABLED","CO2 Steuerung aktiv", "boolean", "indicator", true  ); 
     valloxStateBridges['A_CYC_HOME_SPEED_SETTING'] = new  ValloxStateBridge( configSection, "A_CYC_HOME_SPEED_SETTING","Ventilatorleistung %", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_HOME_AIR_TEMP_TARGET'] = new  ValloxStateBridge( configSection, "A_CYC_HOME_AIR_TEMP_TARGET","Zuluft °C", "number", "indicator", true  ); 

     configSection = "profiles.away";
     valloxStateBridges['A_CYC_AWAY_RH_CTRL_ENABLED'] = new ValloxStateBridge( configSection, "A_CYC_AWAY_RH_CTRL_ENABLED", "Feuchtigkeitsteuerung aktiv", "boolean", "indicator", true  ); 
     valloxStateBridges['A_CYC_AWAY_CO2_CTRL_ENABLED'] = new  ValloxStateBridge( configSection, "A_CYC_AWAY_CO2_CTRL_ENABLED","CO2 Steuerung aktiv", "boolean", "indicator", true  );      
     valloxStateBridges['A_CYC_AWAY_SPEED_SETTING'] = new  ValloxStateBridge( configSection, "A_CYC_AWAY_SPEED_SETTING","Ventilatorleistung %", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_AWAY_AIR_TEMP_TARGET'] = new  ValloxStateBridge( configSection, "A_CYC_AWAY_AIR_TEMP_TARGET","Zuluft °C", "number", "indicator", true  ); 

     configSection = "profiles.boost";
     valloxStateBridges['A_CYC_BOOST_RH_CTRL_ENABLED'] = new ValloxStateBridge( configSection, "A_CYC_BOOST_RH_CTRL_ENABLED", "Feuchtigkeitsteuerung aktiv", "boolean", "indicator", true  ); 
     valloxStateBridges['A_CYC_BOOST_CO2_CTRL_ENABLED'] = new  ValloxStateBridge( configSection, "A_CYC_BOOST_CO2_CTRL_ENABLED","CO2 Steuerung aktiv", "boolean", "indicator", true  );      
     valloxStateBridges['A_CYC_BOOST_SPEED_SETTING'] = new  ValloxStateBridge( configSection, "A_CYC_BOOST_SPEED_SETTING","Ventilatorleistung %", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_BOOST_AIR_TEMP_TARGET'] = new  ValloxStateBridge( configSection, "A_CYC_BOOST_AIR_TEMP_TARGET","Zuluft °C", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_BOOST_TIMER'] = new  ValloxStateBridge( configSection, "A_CYC_BOOST_TIMER","Zeit verbleibend, Setze auf > 0 um zu aktivieren", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_BOOST_TIME'] = new  ValloxStateBridge( configSection, "A_CYC_BOOST_TIME","Dauer in Min", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_BOOST_TIMER_ENABLED'] = new  ValloxStateBridge( configSection, "A_CYC_BOOST_TIMER_ENABLED","Timersteuerung", "number", "indicator", true  ); 


     configSection = "profiles.fireplace";
     valloxStateBridges['A_CYC_FIREPLACE_SUPP_FAN'] = new  ValloxStateBridge( configSection, "A_CYC_FIREPLACE_SUPP_FAN","Zuluftventilator %", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_FIREPLACE_EXTR_FAN'] = new  ValloxStateBridge( configSection, "A_CYC_FIREPLACE_EXTR_FAN","Abluftventilator %", "number", "indicator", true  );      
     valloxStateBridges['A_CYC_FIREPLACE_TIMER'] = new  ValloxStateBridge( configSection, "A_CYC_FIREPLACE_TIMER","Zeit verbleibend, Setze auf > 0 um zu aktivieren", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_FIREPLACE_TIME'] = new  ValloxStateBridge( configSection, "A_CYC_FIREPLACE_TIME","Dauer in Min", "number", "indicator", true  ); 
     valloxStateBridges['A_CYC_FIREPLACE_TIMER_ENABLED'] = new  ValloxStateBridge( configSection, "A_CYC_FIREPLACE_TIMER_ENABLED","Timersteuerung", "number", "indicator", true  ); 


     configSection = "info";     
     valloxStateBridges["A_CYC_SERIAL_NUMBER_MSW"] =  new ValloxStateBridge( configSection, "A_CYC_SERIAL_NUMBER_MSW", "", "string", "indicator", false);
     valloxStateBridges["A_CYC_SERIAL_NUMBER_LSW"] =  new ValloxStateBridge( configSection, "A_CYC_SERIAL_NUMBER_LSW", "", "string", "indicator", false);     

     valloxStateBridges["A_CYC_MODE"] =  new ValloxStateBridge( configSection, "A_CYC_MODE", "Mode - 0 = Normal, 5 = Off", "number", "indicator", true); 

     valloxStateBridges["A_CYC_STATE"] =  new ValloxStateBridge( configSection, "A_CYC_STATE", "Active Profile - 0 = Normal, 1 = Away", "number", "indicator", true); 

}


function initStates()
{
    
    addState('profiles', '', 'channel', '', '', false);
    addState('profiles.home', 'Anwesend', 'channel','', '', false);
    addState('profiles.away', 'Abwesend', 'channel','', '', false);
    addState('profiles.boost', 'Stosslüftung', 'channel', false);
    addState('profiles.fireplace', 'Kaminfunktion', 'channel', false);
    addState('states', '', 'channel','', '', false);
 
/*
    addState('states.PowerState', '', 'state', 'boolean', 'indicator', true);
    addState('states.A_CYC_TEMP_OUTDOOR_AIR', 'A_CYC_TEMP_OUTDOOR_AIR', 'state', 'float', 'indicator', false);
  */  




   for (var key in valloxStateBridges) {    
    var obj =  valloxStateBridges[key];
    addState( obj.IoBrokerConfigPath  +'.' +  obj.VlxDevConstant, obj.Description, 'state', obj.DataType, 'indicator', obj.AllowWrite );    
   }



}

function addState(path, name, stateType, dataType, role, allowWrite){
    adapter.setObject(path, {
        type: stateType,
        common: {
            name: name,
            type: dataType,
            role: role,
            read:  true,
            write: allowWrite
        },
        native: {}
    });

}

function getValloxData()    {
    let url = "";
    readData(url);
    if (!isStopping)  {
        setTimeout(function () {
            getValloxData();
        }, sync_milliseconds);
    };

}

async function readData(url) {        
   
    const valloxClient = new ValloxWebsocket({  ip: adapter.config.host, port: adapter.config.port });    
    

    var keys = []
    for (var key in valloxStateBridges) {    
        keys.push(key);
    }
    
    try
    {        
        const results = await valloxClient.fetchMetrics( keys );
        
        adapter.setState('info.connection', true );        

        for (var key in valloxStateBridges) {    
            var obj =  valloxStateBridges[key];
            
            //adapter.log.info( "Setting State: "+ obj.IoBrokerConfigPath  +'.' +  obj.VlxDevConstant + " to Value: " + key );
            adapter.setState(obj.IoBrokerConfigPath  +'.' +  obj.VlxDevConstant, {val: results[key], ack: true} )
        }








    }    catch(error)
    {
        adapter.log.error(error); 
        adapter.setState('info.connection', false );
    }
}




// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly   
    //initBridge();
    //readData();
    //initStates();
    startAdapter();
} 
