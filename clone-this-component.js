#!/bin/sh
#
#   This script creates a new PastaC component, based on
#   the component who's directory contains this script.
#

# Check parameters passed to the command
if [ $# != 1 ] ; then
  echo
  echo "Usage: $0 <new-component-name>"
  exit 1
fi


# Decide a name for the new component
# Strip off the 'pastac-' prefix
nname=${1}
if echo "${nname}" | grep '^pastac-' > /dev/null ; then
	nname=$(echo "${nname}" | sed 's/^pastac-//')
fi


# Get the name of the current component, from the directory name.
scriptdir=$(cd `dirname $0`; pwd)
oname=$(basename ${scriptdir})
parentdir=$(dirname ${scriptdir})


# Check the component being cloned is a pastac component
if echo $oname | grep ^pastac- > /dev/null ; then
	oname=$(echo ${oname} | sed 's/^pastac-//' )
else
	echo ""
	echo "ERROR: current component name must match 'matching pastac-*'."
	exit 1
fi
#echo oname=${oname}
#echo nname=${nname}

# Work out the variations of the component names used in files
#	pastac-my-component
#	Pastac-my-component
#	pastacMyComponent
#	PastacMyComponent
from1=pastac-${oname}
  to1=pastac-${nname}
from2=Pastac-${oname}
  to2=Pastac-${nname}
#from3=pastac-${oname}
#  to3=pastac-${nname}
#from4=pastac-${oname}
#  to4=pastac-${nname}
from3=$(echo "pastac-${oname}" | perl -pe 's/(-)./uc($&)/ge;s/-//g')
  to3=$(echo "pastac-${nname}" | perl -pe 's/(-)./uc($&)/ge;s/-//g')
from4=$(echo "pastac-${oname}" | perl -pe 's/(^|-)./uc($&)/ge;s/-//g')
  to4=$(echo "pastac-${nname}" | perl -pe 's/(^|-)./uc($&)/ge;s/-//g')
oldname=${from1}
newname=${to1}



# Display a nice message
echo "###"
echo "###"
echo "###		Creating a skeleton component named ${newname}..."
echo "###"
echo "###"


# Work out the directories
src=${parentdir}/${oldname}
dst=${parentdir}/${newname}


# Check the component does not already exist
if [ -d "${dst}" ] ; then
  echo
  echo "Error: directory ${dst} already exists."
  echo
  exit 1
fi
echo ""
echo "src = ${src}"
echo "dst = ${dst}"


# Now create the new directory and its contents
mkdir $dst
echo ""
echo "## Duplicating files..."
(
	cd ${src};
	find . \( -type d \( -name node_modules -o -name bower_components \) -prune \) -o -type f -print0 \
	| tar -cf - --null -T -
) | (cd $dst; tar xf -)


# Switch into the directory and move a few files around
echo ""
echo "## Replace strings in the files..."
echo "  ${from1} => ${to1}"
echo "  ${from2} => ${to2}"
echo "  ${from3} => ${to3}"
echo "  ${from4} => ${to4}"
echo ""
echo "$" cd ${dst}
         cd ${dst}
echo "$" rm dist/*
         rm dist/*
#*/
echo "$" git mv src/${from1}.js src/${to1}.js
         git mv src/${from1}.js src/${to1}.js
echo "$" git mv src/${from1}.pug src/${to1}.pug
         git mv src/${from1}.pug src/${to1}.pug
echo "$" git mv src/${from1}.scss src/${to1}.scss
         git mv src/${from1}.scss src/${to1}.scss


# Detach from the existing git upstream
echo "$" git remote rm origin
         git remote rm origin


# Change the component name
echo ""
echo "## Replacing component name in files..."
echo "$ grep -rl ${from1} *"
for file in `grep -rl "${from1}" *` ; do
  echo "$ sed -i \"\" \"s/${from1}/${to1}/g\" ${file}"
          sed -i "" "s/${from1}/${to1}/g" ${file}
  [ $? != 0 ] && exit 1
done
echo "$ grep -rl ${from2} *"
for file in `grep -rl "${from2}" *` ; do
  echo "$ sed -i \"\" \"s/${from2}/${to2}/g\" ${file}"
          sed -i "" "s/${from2}/${to2}/g" ${file}
  [ $? != 0 ] && exit 1
done
echo "$ grep -rl ${from3} *"
for file in `grep -rl "${from3}" *` ; do
  echo "$ sed -i \"\" \"s/${from3}/${to3}/g\" ${file}"
          sed -i "" "s/${from3}/${to3}/g" ${file}
  [ $? != 0 ] && exit 1
done
echo "$ grep -rl ${from4} *"
for file in `grep -rl "${from4}" *` ; do
  echo "$ sed -i \"\" \"s/${from4}/${to4}/g\" ${file}"
          sed -i "" "s/${from4}/${to4}/g" ${file}
  [ $? != 0 ] && exit 1
done


# Install dependencies
echo ""
echo ""
echo "## Install dependencies with bower..."
echo "$" bower install
         bower install
echo ""
echo ""
echo "## Install dependencies with npm"
echo "$" npm install
         npm install
echo ""
echo ""
echo "## Run gulp to install the project"
echo "$" gulp install
         gulp install


# Finish up
echo ""
echo ""
echo ""
echo "###"
echo "###"
echo "###		HURRAY!"
echo "###"
echo "### Your new component ${newname} is ready at:"
echo "###"
echo "###      ${dst}"
echo "###"
echo "###"
echo "### You will need to create a new Github project and define it as a remote"
echo "### so you can push your development work. For example:"
echo "### "
echo "###      \$ git remote add origin https://github.com/<account>/${newname}.git"
echo "### "
echo "### You can test the component with:"
echo "### "
echo "###      \$ gulp serve"
echo "###"
echo "### Have fun!"
echo "###"
echo "###"
exit 0
