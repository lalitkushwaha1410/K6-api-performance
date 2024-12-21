#LF

##########################################################################
# Unit tests build & run script
#
# The idea is to build an image, then build a temporary container, run tests,
# and finally dispose of the container to keep Teamcity agents clean.
##########################################################################

# Makes the script return immediately when a command fails rather than continue the execution
set -e

# Proxy settings for Teamcity Agent usage 
ENV=$1
RATE=$2
PROXY=$3

# Removes the directory if present.
rm -rf results

# Creates a directory where the test report will be saved.
# It will be bound to a directory inside the Docker container (see docker-compose)"
mkdir results

docker-compose build  --build-arg http_proxy=$PROXY --build-arg https_proxy=$PROXY  perf-load-tests

docker-compose run --rm -e HTTP_PROXY=$PROXY -e environment=$ENV  -e rateConfig=$RATE perf-load-tests
