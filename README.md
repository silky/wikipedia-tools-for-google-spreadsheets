# Wikipedia Tools for Google Spreadsheets
A couple of Wikipedia utilities for use in Google Spreadsheets.

## Documentation
See the [documentation](https://script.google.com/macros/library/versions/d/MGZfQ_cBpwsvTDk_-3Pp5ZWGKoUaL1Yht)
sorted by version (choose the latest stable release).

## Usage
Use it in your spreadsheet following the [managing libraries](https://developers.google.com/apps-script/guide_libraries)
documentation. The required project key is ```MGZfQ_cBpwsvTDk_-3Pp5ZWGKoUaL1Yht```. You can then call the functions in the **scripts editor**
with the identifier prefix `WikipediaTools.` as outlined below:

```javascript
WikipediaTools.WIKISYNONYMS(article);

WikipediaTools.WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject, opt_skipHeader);

WikipediaTools.WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject);

WikipediaTools.WIKISUBCATEGORIES(category);

WikipediaTools.WIKICATEGORYMEMBERS(category);

WikipediaTools.WIKIINBOUNDLINKS(article);

WikipediaTools.WIKIOUTBOUNDLINKS(article);

WikipediaTools.WIKIMUTUALLINKS(article);

WikipediaTools.WIKIGEOCOORDINATES(article);

WikipediaTools.WIKIPAGEVIEWS(article, opt_start, opt_end);

WikipediaTools.WIKIPAGEEDITS(article, opt_start, opt_end);

WikipediaTools.WIKIDATAFACTS(article);

WikipediaTools.GOOGLESUGGEST(keyword, opt_language);
```

If you want to use the provided functions directly from a **cell** as a formula, you need to alias all functions as follows in the scripts editor:

```javascript
function WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject) {
  return WikipediaTools.WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject);
}

function WIKISYNONYMS(article) {
  return WikipediaTools.WIKISYNONYMS(article);
}

function WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject, opt_skipHeader) {
  return WikipediaTools.WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject, opt_skipHeader);
}

function WIKICATEGORYMEMBERS(category) {
  return WikipediaTools.WIKICATEGORYMEMBERS(category);
}

function WIKISUBCATEGORIES(category) {
  return WikipediaTools.WIKISUBCATEGORIES(category);
}

function WIKIINBOUNDLINKS(article) {
  return WikipediaTools.WIKIINBOUNDLINKS(article);
}

function WIKIOUTBOUNDLINKS(article) {
  return WikipediaTools.WIKIOUTBOUNDLINKS(article);
}

function WIKIMUTUALLINKS(article) {
  return WikipediaTools.WIKIMUTUALLINKS(article);
}

function WIKIGEOCOORDINATES(article) {
  return WikipediaTools.WIKIGEOCOORDINATES(article);
}

function WIKIPAGEVIEWS(article, opt_start, opt_end) {
  return WikipediaTools.WIKIPAGEVIEWS(article, opt_start, opt_end);
}

function WIKIPAGEEDITS(article, opt_start, opt_end) {
  return WikipediaTools.WIKIPAGEEDITS(article, opt_start, opt_end);
}

function WIKIDATAFACTS(article) {
  return WikipediaTools.WIKIDATAFACTS(article);
}

function GOOGLESUGGEST(keyword, opt_language) {
  return WikipediaTools.GOOGLESUGGEST(keyword, opt_language);
}
```

## Demo
See the output of the functions in this [Google spreadsheet](https://docs.google.com/spreadsheets/d/1sVduZul787O-bRzuy0UKpRl7bkouxwaIOsxXuJGm6yg/edit?usp=sharing).

## License

Copyright 2016 Thomas Steiner (@tomayac)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
