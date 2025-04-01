#!/bin/bash

iob del discovery
iob plugin disable sentry
iob object set system.config common.licenseConfirmed=true 
NPM_PACK=$(npm pack)
iob url $(pwd)/$NPM_PACK --debug
iob add valloxmv
iob stop valloxmv
iob object set system.adapter.valloxmv.0 native.host=192.168.0.15
rm $NPM_PACK