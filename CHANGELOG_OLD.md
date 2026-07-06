# Older changes
## 1.2.0
* Remove NodeJS 10.x support
* Upgrade to js-controller 3.3 and Admin 5

## 1.1.3
* Fixed wrong datatype (number instead of boolean) in profile entries *_ENABLED [#33](https://github.com/hacki11/ioBroker.valloxmv/issues/33).
* Fixed setting connection info without ack value.

## 1.1.2
* Fixed wrong datatype (string) in temperature states instead of numbers

## 1.1.1
* Fix adapter-checker issues

## 1.1.0
* A_CYC_BYPASS_LOCKED added
* A_CYC_SUPP_FAN_BALANCE_BASE added
* A_CYC_EXTR_FAN_BALANCE_BASE added
* A_CYC_IP_ADDRESS added
* A_CYC_CELL_STATE changed to read only

## 1.0.3
* Fix adapter-checker issues

## 1.0.2
* Added subscriptions of own objects to allow write values

## 1.0.1 
* Fixed resetting custom configuration of objects
* Removed subscription of own objects

## 1.0.0
* Fixed empty states
* Canged bool states to switches

## 0.1.3
* added expert settings (@williandalton, @hliebscher)
  * A_CYC_RH_BASIC_LEVEL
  * A_CYC_CO2_THRESHOLD
  * A_CYC_RH_LEVEL_MODE
  * A_CYC_SUPPLY_HEATING_ADJUST_MODE
  * A_CYC_OPT_TEMP_SENSOR_MODE

## 0.1.2
* add State 'NORMAL' to A_CYC_MODE (@williandalton)

## 0.1.1
* fix io-package.json version number

## 0.1.0
* added profile switch and editing

## 0.0.1
* (hacki11) initial release
