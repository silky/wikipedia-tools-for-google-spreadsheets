/**
 * @license
 * Copyright 2016 Thomas Steiner (@tomayac). All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var HEADERS = {headers: {'Cache-Control': 'max-age=0'}};

/**
 * Returns Wikipedia synonyms (redirects) for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get synonyms for.
 * @return {Array<string>} The list of synonyms.
 * @customfunction
 */
function WIKISYNONYMS(article) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&blnamespace=0' +
        '&list=backlinks' +
        '&blfilterredir=redirects' +
        '&bllimit=max' +
        '&format=xml' +
        '&bltitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('backlinks').getChildren('bl');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia translations (language links) for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations for.
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional).
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional).
 * @param {boolean=} opt_skipHeader Whether to skip the header, defaults to false (optional).
 * @return {Array<string>} The list of translations.
 * @customfunction
 */
function WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject,
    opt_skipHeader) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = {};
  opt_targetLanguages = opt_targetLanguages || [];
  opt_targetLanguages = Array.isArray(opt_targetLanguages) ?
      opt_targetLanguages : [opt_targetLanguages];
  var temp = {};
  opt_targetLanguages.forEach(function(lang) {
    temp[lang] = true;
  });
  opt_targetLanguages = Object.keys(temp);
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    opt_targetLanguages.forEach(function(targetLanguage) {
      if (targetLanguage) {
        results[targetLanguage] = title.replace(/_/g, ' ');
      }
    });
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=langlinks' +
        '&format=xml' +
        '&lllimit=max' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('langlinks').getChildren('ll');
    var targetLanguagesSet = opt_targetLanguages.length > 0;
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getText();
      var lang = entries[i].getAttribute('lang').getValue();
      if ((targetLanguagesSet) && (opt_targetLanguages.indexOf(lang) === -1)) {
        continue;
      }
      results[lang] = text;
    }
    title = title.replace(/_/g, ' ');
    results[language] = title;
  } catch (e) {
    // no-op
  }
  if (opt_returnAsObject) {
    return results;
  }
  var arrayResults = [];
  for (var lang in results) {
    if (opt_skipHeader) {
      arrayResults.push(results[lang]);
    } else {
      arrayResults.push([lang, results[lang]]);
    }
  }
  return arrayResults.length > 0 ? arrayResults : '';
}

/**
 * Returns Wikipedia translations (language links) and synonyms (redirects) for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations and synonyms for.
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional).
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional).
 * @return {Array<string>} The list of translations and synonyms.
 * @customfunction
 */
function WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = opt_returnAsObject ? {} : [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    opt_targetLanguages = opt_targetLanguages || [];
    opt_targetLanguages = Array.isArray(opt_targetLanguages) ?
        opt_targetLanguages : [opt_targetLanguages];
    var temp = {};
    opt_targetLanguages.forEach(function(lang) {
      temp[lang] = true;
    });
    opt_targetLanguages = Object.keys(temp);
    var translations = WIKITRANSLATE(article, opt_targetLanguages, true);
    var i = 0;
    for (var lang in translations) {
      var synonyms = WIKISYNONYMS(lang + ':' + translations[lang]);
      if (opt_returnAsObject) {
        results[lang] = [translations[lang]].concat(synonyms);
      } else {
        results[i] = [lang].concat(([translations[lang]].concat(synonyms)));
      }
      i++;
    }
  } catch (e) {
    // no-op
  }
  return opt_returnAsObject ? results : results;
}

/**
 * Returns Wikipedia category members for a Wikipedia category.
 *
 * @param {string} category The Wikipedia category in the format "language:Category_Title" ("en:Category:Visitor_attractions_in_Berlin") to get members for.
 * @return {Array<string>} The list of category members.
 * @customfunction
 */
function WIKICATEGORYMEMBERS(category) {
  'use strict';
  if (!category) {
    return '';
  }
  var results = [];
  try {
    var language = category.split(/:(.+)?/)[0];
    var title = category.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=categorymembers' +
        '&cmlimit=max' +
        '&cmprop=title' +
        '&cmtype=subcat%7Cpage' +
        '&format=xml' +
        '&cmnamespace=0' +
        '&cmtitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('categorymembers').getChildren('cm');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia subcategories for a Wikipedia category.
 *
 * @param {string} category The Wikipedia category in the format "language:Category_Title" ("en:Category:Visitor_attractions_in_Berlin") to get subcategories for.
 * @return {Array<string>} The list of subcategories.
 * @customfunction
 */
function WIKISUBCATEGORIES(category) {
  'use strict';
  if (!category) {
    return '';
  }
  var results = [];
  try {
    var language = category.split(/:(.+)?/)[0];
    var title = category.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=categorymembers' +
        '&cmlimit=max' +
        '&cmprop=title' +
        '&cmtype=subcat%7Cpage' +
        '&format=xml' +
        '&cmnamespace=14' +
        '&cmtitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('categorymembers').getChildren('cm');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia inbound links for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get inbound links for.
 * @return {Array<string>} The list of inbound links.
 * @customfunction
 */
function WIKIINBOUNDLINKS(article) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=backlinks' +
        '&bllimit=max' +
        '&blnamespace=0' +
        '&format=xml' +
        '&bltitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('backlinks').getChildren('bl');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia outbound links for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get outbound links for.
 * @return {Array<string>} The list of outbound links.
 * @customfunction
 */
function WIKIOUTBOUNDLINKS(article) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=links' +
        '&plnamespace=0' +
        '&format=xml' +
        '&pllimit=max' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('links').getChildren('pl');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia mutual links, i.e, the intersection of inbound and outbound links for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get mutual links for.
 * @return {Array<string>} The list of mutual links.
 * @customfunction
 */
function WIKIMUTUALLINKS(article) {
  'use strict';
  var inboundLinks = WIKIINBOUNDLINKS(article);
  var outboundLinks = WIKIOUTBOUNDLINKS(article);
  var mutualLinks = inboundLinks.filter(function(link) {
    return outboundLinks.indexOf(link) > -1;
  });
  return mutualLinks;
}

/**
 * Returns Wikipedia geocoordinates for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get geocoordinates for.
 * @return {Array<number>} The latitude and longitude.
 * @customfunction
 */
function WIKIGEOCOORDINATES(article) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    var url = 'https://en.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=coordinates' +
        '&format=xml' +
        '&colimit=max' +
        '&coprimary=primary' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var coordinates = document.getRootElement().getChild('query')
        .getChild('pages').getChild('page').getChild('coordinates')
        .getChild('co');
    var latitude = coordinates.getAttribute('lat').getValue();
    var longitude = coordinates.getAttribute('lon').getValue();
    results = [[latitude, longitude]];
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikidata facts for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get Wikidata facts for.
 * @param {string=} opt_multiObjectMode Whether to return all object values (pass "all") or just the first (pass "first") when there are more than one object values (optional).
 * @return {Array<string>} The list of Wikidata facts.
 * @customfunction
 */
function WIKIDATAFACTS(article, opt_multiObjectMode) {
  'use strict';

  var simplifyClaims = function(claims) {
    var simpleClaims = {};
    for (var id in claims) {
      var claim = claims[id];
      simpleClaims[id] = simpifyClaim(claim);
    }
    return simpleClaims;
  };

  var simpifyClaim = function(claim) {
    var simplifiedClaim = [];
    var len = claim.length;
    for (var i = 0; i < len; i++) {
      var statement = claim[i];
      var simpifiedStatement = simpifyStatement(statement);
      if (simpifiedStatement !== null) {
        simplifiedClaim.push(simpifiedStatement);
      }
    }
    return simplifiedClaim;
  };

  var simpifyStatement = function(statement) {
    var mainsnak = statement.mainsnak;
    if (mainsnak === null) {
      return null;
    }
    var datatype = mainsnak.datatype;
    var datavalue = mainsnak.datavalue;
    if (datavalue === null || datavalue === undefined) {
      return null;
    }
    switch (datatype) {
      case 'string':
      case 'commonsMedia':
      case 'url':
      case 'math':
      case 'external-id':
        return datavalue.value;
      case 'monolingualtext':
        return datavalue.value.text;
      case 'wikibase-item':
        var qid = 'Q' + datavalue.value['numeric-id'];
        qids.push(qid);
        return qid;
      case 'time':
        return datavalue.value.time;
      case 'quantity':
        return datavalue.value.amount;
      default:
        return null;
    }
  };

  var getPropertyAndEntityLabels = function(propertiesAndEntities) {
    var labels = {};
    try {
      var size = 50;
      var j = propertiesAndEntities.length;
      for (var i = 0; i < j; i += size) {
        var chunk = propertiesAndEntities.slice(i, i + size);
        var url = 'https://www.wikidata.org/w/api.php' +
            '?action=wbgetentities' +
            '&languages=en' +
            '&format=json' +
            '&props=labels' +
            '&ids=' + chunk.join('%7C');
        var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
        var entities = json.entities;
        chunk.forEach(function(item) {
          if ((entities[item]) &&
              (entities[item].labels) &&
              (entities[item].labels.en) &&
              (entities[item].labels.en.value)) {
            labels[item] = entities[item].labels.en.value;
          } else {
            labels[item] = false;
          }
        });
      }
    } catch (e) {
      // no-op
    }
    return labels;
  };

  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    var url = 'https://wikidata.org/w/api.php' +
        '?action=wbgetentities' +
        '&sites=' + language + 'wiki' +
        '&format=json' +
        '&props=claims' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
    var entity = Object.keys(json.entities)[0];
    var qids = [];
    var simplifiedClaims = simplifyClaims(json.entities[entity].claims);
    var properties = Object.keys(simplifiedClaims);
    var labels = getPropertyAndEntityLabels(properties.concat(qids));
    for (var claim in simplifiedClaims) {
      var claims = simplifiedClaims[claim].filter(function(value) {
        return value !== null;
      });
      // Only return single-object facts
      if (claims.length === 1) {
        var label = labels[claim];
        var value = /^Q\d+$/.test(claims[0]) ? labels[claims[0]] : claims[0];
        if (label && value) {
          results.push([label, value]);
        }
      }
      // Optionally return multi-object facts
      if ((
            (/^first$/i.test(opt_multiObjectMode)) ||
            (/^all$/i.test(opt_multiObjectMode))
          ) && (claims.length > 1)) {
        var label = labels[claim];
        claims.forEach(function(claimObject, i) {
          if (i > 0 && /^first$/i.test(opt_multiObjectMode)) {
            return;
          }
          var value = /^Q\d+$/.test(claimObject) ?
              labels[claimObject] : claimObject;
          if (label && value) {
            results.push([label, value]);
          }
        });
      }
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia pageviews statistics for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get pageviews statistics for.
 * @param {string=} opt_start The start date in the format "YYYYMMDD" ("2007-06-08") since when pageviews statistics should be retrieved from (optional).
 * @param {string=} opt_end The end date in the format "YYYYMMDD" ("2007-06-08") until when pageviews statistics should be retrieved to (optional).
 * @return {Array<number>} The list of pageviews between start and end per day.
 * @customfunction
 */
function WIKIPAGEVIEWS(article, opt_start, opt_end) {
  'use strict';

  var getIsoDate = function(date) {
    var date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1) < 10 ?
        '0' + (date.getMonth() + 1) :
        (date.getMonth() + 1).toString();
    var day = date.getDate() < 10 ?
        '0' + date.getDate() :
        date.getDate().toString();
    return year + month + day;
  };

  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    opt_start = opt_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (typeof opt_start === 'object') {
      opt_start = getIsoDate(opt_start);
    }
    opt_end = opt_end || new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    if (typeof opt_end === 'object') {
      opt_end = getIsoDate(opt_end);
    }
    var url = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/' +
        'per-article' +
        '/' + language + '.wikipedia' +
        '/all-access' +
        '/user' +
        '/' +  encodeURIComponent(title.replace(/\s/g, '_')) +
        '/daily' +
        '/' + opt_start +
        '/' + opt_end;
    var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
    json.items.forEach(function(item) {
      var timestamp = item.timestamp
          .replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3-$4').split('-');
      timestamp = new Date(Date.UTC(
          parseInt(timestamp[0], 10), // Year
          parseInt(timestamp[1], 10) - 1, // Month
          parseInt(timestamp[2], 10), // Day
          parseInt(timestamp[3], 10), // Hour
          0, // Minute
          0)); // Second))
      results.push([
        timestamp,
        item.views
      ]);
    });
    results.reverse(); // Order from new to old
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia pageedits statistics for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get pageedits statistics for.
 * @param {string=} opt_start The start date in the format "YYYYMMDD" ("2007-06-08") since when pageedits statistics should be retrieved from (optional).
 * @param {string=} opt_end The end date in the format "YYYYMMDD" ("2007-06-08") until when pageedits statistics should be retrieved to (optional).
 * @return {Array<number>} The list of pageedits between start and end and their deltas.
 * @customfunction
 */
function WIKIPAGEEDITS(article, opt_start, opt_end) {
  'use strict';

  var getIsoDate = function(date, time) {
    var date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1) < 10 ?
        '0' + (date.getMonth() + 1) :
        (date.getMonth() + 1).toString();
    var day = date.getDate() < 10 ?
        '0' + date.getDate() :
        date.getDate().toString();
    return year + '-' + month + '-' + day + time;
  };

  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(/:(.+)?/)[0];
    var title = article.split(/:(.+)?/)[1];
    if (!title) {
      return '';
    }
    opt_start = opt_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (typeof opt_start === 'object') {
      opt_start = getIsoDate(opt_start, 'T00:00:00');
    }
    opt_end = opt_end || new Date();
    if (typeof opt_end === 'object') {
      opt_end = getIsoDate(opt_end, 'T23:59:59');
    }
    var url = 'https://en.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=revisions' +
        '&rvprop=size%7Ctimestamp' +
        '&rvlimit=max' +
        '&format=xml' +
        '&rvstart=' + opt_end + // Reversed on purpose due to confusing API name
        '&rvend=' + opt_start + // Reversed on purpose due to confusing API name
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('revisions').getChildren('rev');
    for (var i = 0; i < entries.length - 1; i++) {
      var timestamp = entries[i].getAttribute('timestamp').getValue().replace(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/,
          '$1-$2-$3-$4-$5-$6').split('-');
      timestamp = new Date(Date.UTC(
          parseInt(timestamp[0], 10), // Year
          parseInt(timestamp[1], 10) - 1, // Month
          parseInt(timestamp[2], 10), // Day
          parseInt(timestamp[3], 10), // Hour
          parseInt(timestamp[4], 10), // Minute
          parseInt(timestamp[5], 10))); // Second
      var delta = entries[i].getAttribute('size').getValue() -
          entries[i + 1].getAttribute('size').getValue();
      results.push([
        timestamp,
        delta
      ]);
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Google Suggest results for the given keyword.
 *
 * @param {string} keyword The keyword to get suggestions for.
 * @param {string=} opt_language The language to get suggestions in, defaults to "en" (optional).
 * @return {Array<string>} The list of suggestions.
 * @customfunction
 */
function GOOGLESUGGEST(keyword, opt_language) {
  'use strict';
  if (!keyword) {
    return '';
  }
  opt_language = opt_language || 'en';
  var results = [];
  try {
    var url = 'https://suggestqueries.google.com/complete/search' +
        '?output=toolbar' +
        '&hl=' + opt_language +
        '&q=' + encodeURIComponent(keyword);
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChildren('CompleteSuggestion');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getChild('suggestion').getAttribute('data')
          .getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Executed on add-on install.
 */
function onInstall() {
  'use strict';
  onOpen();
}

/**
 * Executed on add-on open.
 */
function onOpen() {
  'use strict';
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Show documentation', 'showDocumentation_')
      .addToUi();
}

/**
 * Shows a sidebar with help.
 */
function showDocumentation_() {
  'use strict';
  var html = HtmlService.createHtmlOutputFromFile('Documentation')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Documentation')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}
