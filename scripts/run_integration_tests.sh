#!/usr/bin/env bash

function get_docker_pid () {
    # REVIEW: This works on macOs, but may not work on other platforms.
    lsof -i tcp:9944 | grep docke | xargs | awk '{print $2}'
}

function cleanup () {
    local signal="$1"

    case "$signal" in
        TERM|INT)
            # Catch TERM and INT signals and exit gracefully
            echo "Caught signal ${signal}; exiting..."
            exit
            ;;
        EXIT)
            docker stop vitest-node
            echo "Frequency docker has been stopped. 💀"
            ;;
    esac
}

RUNDIR=$(dirname ${0})
CHAIN="development"

# A distinction is made between the local node and the the test chain
# because the local node will be built and generate the js api augment
# for the polkadot.js api even when testing against a live chain.
LOCAL_NODE_BLOCK_SEALING="instant"

trap 'cleanup EXIT' EXIT
trap 'cleanup TERM' TERM
trap 'cleanup INT' INT

while getopts "sc:" OPTNAME
do
    case "${OPTNAME}" in
        "c")
            CHAIN=$OPTARG
        ;;
    esac
done
shift $((OPTIND-1))

case "${CHAIN}" in
    "development")
        PROVIDER_URL="ws://127.0.0.1:9944"
        CHAIN_ENVIRONMENT="dev"

        if [[ "$1" == "load" ]]; then
            NPM_RUN_COMMAND="test:load"
            LOCAL_NODE_BLOCK_SEALING="manual"
        fi
    ;;
    "rococo_local")
        PROVIDER_URL="ws://127.0.0.1:9944"
        NPM_RUN_COMMAND="test:relay"
        CHAIN_ENVIRONMENT="rococo-local"
    ;;
    "rococo_testnet")
        PROVIDER_URL="wss://rpc.rococo.frequency.xyz"
        NPM_RUN_COMMAND="test:relay"
        CHAIN_ENVIRONMENT="rococo-testnet"

        read -p "Enter the seed phrase for the Frequency Rococo account funding source: " FUNDING_ACCOUNT_SEED_PHRASE

    ;;
esac

if [ "${CHAIN_ENVIRONMENT}" = "rococo-local" ]
then
    echo "Frequency is not running."
    echo "The intended use case of running integration tests with a chain environment"
    echo "of \"rococo-local\" is to run the tests against a locally running Frequency"
    echo "chain with locally running Polkadot relay nodes."
    exit 1
fi

echo "Starting a Docker Frequency Node with block sealing ${LOCAL_NODE_BLOCK_SEALING}..."
case ${LOCAL_NODE_BLOCK_SEALING} in
    "instant") \
        docker run --rm -p 9944:9944 -p 9933:9933 -p 30333:30333 --platform=linux/amd64 \
        --name vitest-node --detach \
        frequencychain/instant-seal-node:latest &
    ;;
    "manual") ${RUNDIR}/init.sh start-frequency-manual >& frequency.log &
    ;;
esac

echo "The integration test output will be logged on this console"
echo -e "The Docker Frequency node output will be logged to docker logs\n"
echo -e "You can:\n\t'docker logs --follow vitest-node'\n\n\tin another terminal to see both side-by-side."
echo -e "\t(Now would be a good time to try accessing the docker logs,\n\t which are only available while the node is running.)\n"

# TODO: Find a better way to determine if the node is running.
# The Connect test will fail without this delay.
# using `nc -zv localhost 9944` to check the WebSocket connection was not sufficient.
sleep 6

npm install &> /dev/null
echo "---------------------------------------------"
echo "Starting Tests..."
echo "---------------------------------------------"

npm run test:once
