#! /bin/bash

apiKey="wZIkQY6rasZg1bmm5TFF1sB5AA079Ha4uVfwzkSd"
url="https://553sorqzoj.execute-api.us-east-2.amazonaws.com"
defaultStages="/dev /test"
doPut="n"
doGet="n"
getPath="/schema/activity"
putPath="/activity"
payload="test-payload.json"

function Usage {
  echo "$0 [--key <apiKey>] [--url <apiGatewayUrl>] [--env <env>] \\"
  echo "      [--put] [--putPath <path>] [--payload <payloadFile>] \\"
  echo "      [--get] [--getPath <path>] [--debug]"
  echo "  --key     the API Key to use ($apiKey)"
  echo "  --url     the API Gateway URL ($url)"
  echo "  --put     execute a PUT operation ($doPut) on each stage"
  echo "  --putPath path to use in URL for the PUT operation ($putPath)"
  echo "  --payload file to use as the payload for the PUT operation ($payload)"
  echo "  --get     execute a GET operation ($doGet) on each stage"
  echo "  --getPath path to use in URL for the GET operation ($getPath)"
  echo "  --env     the environment(s) to test.  can be multiple.  default ($defaultStages)"
  echo "  --debug   turn on curl debug flag"
}

while [ $# -gt 0 ]
do
  case $1 in
  --key) shift; apiKey=$1;;
  --url) shift; url=$1;;
  --env) shift; env="$env /$1";;
  --debug) debugFlag="-v";;
  --put) doPut="y";;
  --putPath) shift; putPath=$1;;
  --payload) shift; payload=$1;;
  --get) doGet="y";;
  --getPath) shift; getPath=$1;;
  *) Usage; exit 1;;
  esac
  shift;
done

stages=${env:-$defaultStages}

for i in $stages
do
	[ $doPut == "y" ] && curl ${debugFlag} -X POST --data-binary @${payload} --header "Content-Type: application/json" --header "x-api-key: ${apiKey}"  ${url}${i}${putPath}
	[ $doGet == "y" ] && curl ${debugFlag} --header "x-api-key: ${apiKey}"  ${url}${i}${getPath}
done
