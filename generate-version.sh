#!/bin/bash

NOW=`date +"%y.%-m.%-d-%-H.%-M.%-S"`

jq ".version |= \"$NOW\"" package.json > package.json.tmp && mv package.json.tmp package.json
