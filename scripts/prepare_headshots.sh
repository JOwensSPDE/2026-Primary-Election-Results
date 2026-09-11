#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 '/path/to/Election headshots.zip'" >&2
  exit 2
fi

archive=$1
project_dir=$(cd "$(dirname "$0")/.." && pwd)
source_dir=$(mktemp -d)
output_dir="$project_dir/public/assets/headshots"
trap 'rm -rf "$source_dir"' EXIT

mkdir -p "$output_dir"
unzip -q "$archive" -d "$source_dir"
root="$source_dir/Election headshots"

make_headshot() {
  local relative_path=$1
  local slug=$2
  convert "$root/$relative_path" -auto-orient -thumbnail '480x480^' -gravity center -extent 400x400 -strip -quality 84 "$output_dir/$slug.jpg"
}

make_headshot 'Dem Senate/Jeff Appelhans.jpeg' 'jeff-appelhans'
make_headshot 'Dem Senate/Chris Coons.jpg' 'chris-coons'
make_headshot 'Dem Senate/Eric Hansen.jpeg' 'e-no-trump-hansen'
make_headshot 'Dem Senate/Mary Louve.jpg' 'mary-louve'
make_headshot 'GOP Senate/Mike Katz.png' 'michael-dr-mike-katz'
make_headshot 'GOP Senate/John Shulli.jpg' 'john-shulli'
make_headshot 'GOP House/Joe Arminio.jpg' 'joseph-dr-joe-arminio'
make_headshot 'GOP House/Earl Cooper.jpg' 'earl-l-cooper'
make_headshot 'GOP House/John-Whalen-Congress-750-80q.jpg' 'john-j-whalen'
make_headshot 'Attorney General/Dwayne Bensing.jpg' 'dwayne-j-bensing'
make_headshot 'Attorney General/Kathy Jennings.jpg' 'kathy-jennings'
make_headshot 'Attorney General/Patty Rickman.png' 'patty-rickman'
make_headshot 'Treasurer/Ted Lauzen.png' 'ted-lauzen'
make_headshot 'Treasurer/Mike Miller.jpg' 'mike-miller'
make_headshot 'Treasurer/Michael A Smith.jpeg' 'michael-alexander-smith'

make_headshot 'SD1/Adriana Bohm.jpeg' 'adriana-leela-bohm'
make_headshot 'SD1/Dan Cruce.jpg' 'dan-cruce'
make_headshot 'SD5/Shay arms folded.jpg' 'shay-frisby'
make_headshot 'SD5/Seigfried Ray.jpg' 'ray-seigfried'
make_headshot 'SD7/Jose Lopez.png' 'jose-a-lopez'
make_headshot 'SD7/Spiros Mantzavinos.png' 'spiros-mantzavinos'
make_headshot 'SD9/Jack Walsh.jpg' 'jack-walsh'
make_headshot 'SD12/Nicole Poore.jpg' 'nicole-poore'
make_headshot 'SD12/Keonna Watson.jpg' 'keonna-watson'
make_headshot 'SD14/Christopher Beardsley.png' 'chris-beardsley'
make_headshot 'SD14/Kyra Hoffner.jpg' 'kyra-l-hoffner'

make_headshot 'RD1/Nnamdi Chukwuocha.jpeg' 'nnamdi-o-chukwuocha'
make_headshot 'RD1/Shané Darby 2.jpg' 'shane-nicole-darby'
make_headshot 'RD2/Stephanie Bolden.jpeg' 'stephanie-t-bolden'
make_headshot 'RD2/Michelle Booker.jpg' 'michelle-h-booker'
make_headshot 'RD3/Branden Fletcher-Dominguez.png' 'branden-fletcher-dominguez'
make_headshot 'RD3/Yolanda McCoy.jpg' 'yolanda-m-mccoy'
make_headshot 'RD3/Josue Ortega.jpg' 'josue-o-ortega'
make_headshot 'RD6/Rae Krantz.jpg' 'rachel-rae-krantz'
make_headshot 'RD6/Ed Mulvihill.jpeg' 'ed-mulvihill'
make_headshot 'RD6/Ralf Santana.jpg' 'ralf-santana'
make_headshot 'RD8/Lissa Brutus.jpg' 'lissa-brutus'
make_headshot 'RD8/Rae Moore.png' 'sherae-a-rae-moore'
make_headshot 'RD8/Matthew Powell.jpeg' 'matt-powell'
make_headshot 'RD8 GOP/Watara Heath IV.jpg' 'watara-t-f-heath'
make_headshot 'RD8 GOP/Gary Taylor.png' 'gary-taylor'
make_headshot 'RD9/Ayanna Khan-Flowers.jpg' 'ayanna-khan-flowers'
make_headshot 'RD9/Gemma Lowery.JPG' 'gemma-e-lowery'
make_headshot 'RD9/Michelle Wall.jpg' 'michelle-wall'
make_headshot 'RD12/Rob Bahnsen.JPG' 'robert-f-bahnsen-jr'
make_headshot 'RD12/Krista Griffith.jpeg' 'krista-griffith'
make_headshot 'RD16/Frank Cooke.jpg' 'franklin-d-cooke-jr'
make_headshot 'RD16/Pamela Salaam Headshot.JPG' 'pamela-salaam'
make_headshot 'RD19/Will Imbrie-Moore.jpg' 'will-imbrie-moore'
make_headshot 'RD19/Kimberly Williams.jpg' 'kim-williams'
make_headshot 'RD20/Alonna Berry.jpg' 'alonna-berry'
make_headshot 'RD20/Ruby Schaeffer.jpeg' 'ruby-keeler-schaeffer'
make_headshot "RD23/Luann D'Agostino.png" 'luann-d-agostino'
make_headshot 'RD23/Joe Jasper.jpeg' 'joe-jasper'
make_headshot 'RD23/David Redlawsk.jpg' 'dave-redlawsk'
make_headshot 'RD23/Dan Seador.jpg' 'dan-seador'
make_headshot 'RD27/Eric Morrison.jpeg' 'eric-morrison'
make_headshot 'RD27/Chris Muntz.jpg' 'christopher-w-muntz'
make_headshot 'RD28/Bill Carson Jr..png' 'william-carson-jr'
make_headshot 'RD28/Tyeisha Grier.jpg' 'tyeisha-tye-grier'
make_headshot 'RD32/Kerri Evelyn Harris.png' 'kerri-evelyn-harris'
make_headshot 'RD32/LaChelle Paul.jpg' 'lachelle-paul'
make_headshot 'RD33/Matt Bucher.jpg' 'matt-bucher'
make_headshot 'RD33/Hudson Hudson.jpg' 'morgan-hudson'
make_headshot 'RD36/Shupe Headshot.jpg' 'bryan-william-shupe'
make_headshot 'RD36/Patrick Smith.png' 'patrick-smith'
make_headshot 'RD41/Atkins Headshot II.png' 'john-atkins'
make_headshot 'RD41/Doug Conaway II.jpg' 'doug-conaway'
make_headshot 'RD41/Jacki Slonin I.jpg' 'jacki-slonin'

make_headshot 'NCC3/Kira Alejandro.jpg' 'kira-alejandro'
make_headshot 'NCC3/Kyle Grantham.jpg' 'kyle-r-grantham'
make_headshot 'NCC4/Helena Creamer.jpeg' 'helena-m-creamer'
make_headshot 'NCC4/Jason Hoover.png' 'jason-hoover'
make_headshot 'NCC4/Curtis Linton.webp' 'curtis-dauntell-linton'
make_headshot 'NCC5/Valerie George.png' 'valerie-george'
make_headshot 'NCC5/Syam Kosigi.jpg' 'syam-kosigi'
make_headshot 'NCC Recorder of Deeds/Michael Kozikowski.webp' 'michael-e-kozikowski-sr'
make_headshot 'NCC Recorder of Deeds/David Tackett.jpeg' 'david-tackett'

echo "Prepared $(find "$output_dir" -maxdepth 1 -type f -name '*.jpg' | wc -l | tr -d ' ') headshots in $output_dir"
