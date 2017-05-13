#!/bin/bash
#
#
#	See https://github.com/tooltwist/slate.git


# Prepare directories.
HERE=$(cd `dirname $0`; pwd)
SLATE=${HERE}/slate

# Where the files come from.
SOURCE=${HERE}/../api-docs-source
mkdir -p ${SOURCE}
SOURCE=$(cd $SOURCE; pwd)

# Where the documentation gets published
BUILD=${HERE}/../docs
mkdir -p ${BUILD}
BUILD=$(cd $BUILD; pwd)


#echo xxxxxxxxxxxxxxxxxxxxxxxxxxx
#echo $SLATE
#ls -l $SLATE
#echo xxxxxxxxxxxxxxxxxxxxxxxxxxx
#echo $SOURCE
#ls -l $SOURCE
#echo xxxxxxxxxxxxxxxxxxxxxxxxxxx
#echo $BUILD
#ls -l $BUILD
#echo xxxxxxxxxxxxxxxxxxxxxxxxxxx

echo ""
echo ""
echo "Generating API documentation from ${SOURCE}..."
echo ""

# Generate the documentation
#set -x
docker run --rm \
	-v ${SLATE}:/usr/src/app/slate \
	-v ${SOURCE}:/usr/src/app/slate/source \
	-v ${BUILD}:/usr/src/app/slate/build \
	-w /usr/src/app/slate \
	slate_app bundle exec middleman build --no-clean

rv=$?

echo
echo 
exit $rv
