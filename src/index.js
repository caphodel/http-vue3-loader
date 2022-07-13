function parseComponentURL(url) {

	var comp = url.match(/(.*?)([^/]+?)\/?(\.vue)?(\?.*|#.*|$)/);
	return {
		name: comp[2],
		//url: comp[1] + comp[2] + (comp[3] === undefined ? '/index.vue' : comp[3]) + comp[4]
		url: comp[1] + comp[2] + (comp[3] === undefined ? '' : comp[3]) + comp[4]
	};
}

function resolveURL(baseURL, url) {

	if (url.substr(0, 2) === './' || url.substr(0, 3) === '../') {
		return baseURL + url;
	}
	return url;
}

function addScopes(id, rules, content) {
	if (!rules)
		return []
	var scopeName = id,
		rulesText = [],
		length = rules.length
	for (var i = 0; i < length; ++i) {

		var rule = rules[i];
		if (rule.type !== 1) {
			continue;
		}

		var scopedSelectors = [];

		rule.selectorText.split(/\s*,\s*/).forEach(function (sel) {

			scopedSelectors.push(scopeName + ' ' + sel);
			var segments = sel.match(/([^ :]+)(.+)?/);
			scopedSelectors.push(segments[1] + '[' + scopeName + ']' + (segments[2] || ''));
		});

		var scopedRule = scopedSelectors.join(',') + rule.cssText.substr(rule.selectorText.length);
		rulesText.push(scopedRule)
	}

	for (let i = 0; i < content.children.length; i++) {
		const val = content.children[i];
		val.setAttribute(scopeName, '');
	}

	return rulesText;
}

var scopeId = 0

function loadComponent(url, vname) {
	return Vue.defineAsyncComponent(
		() =>
		new Promise(async (resolve, reject) => {
			try {
				scopeId++
				var id = 'data-v-' + scopeId,
				rulesText = [],
				styleTag = document.getElementById('v-style-vue3httpasyncloader')

				if (styleTag == null) {
					styleTag = document.createElement("style");
					styleTag.setAttribute('id', 'v-style-vue3httpasyncloader')
					styleTag.appendChild(document.createTextNode(""));
					// Add the <style> element to the page
					document.head.appendChild(styleTag);
				}

				var allSheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;

				var data = await this.httpRequest(url)
				//var data = await response.text()
				var doc = document.implementation.createHTMLDocument('');

				doc.body.innerHTML = data;
				var vueTemplate = {},
					script = false
				//if(doc.body.querySelectorAll('template') == null)
				if (doc.body.querySelectorAll('template').length == 0) {
					doc.body.innerHTML = '<script>' + data + '</script>'
					script = true
					vueTemplate.script = doc.body.firstChild
				} else {
					for (var el = doc.body.firstChild; el; el = el.nextSibling) {
						switch (el.nodeName) {
							case 'TEMPLATE':
								vueTemplate.template = el
								break;
							case 'SCRIPT':
								vueTemplate.script = el
								break;
							case 'STYLE':
								vueTemplate.styles = el
								break;
						}
					}
				}

				var childLoader = function (childURL, childName) {

					return loadComponent(childURL, childName);
				}.bind(vueTemplate.script);

				vueTemplate.script.module = {
					exports: {}
				}

				if (typeof module === 'object' && typeof exports === 'object')
					module.exports = loadComponent()

				Function('exports', 'require', 'module', vueTemplate.script.textContent).call(vueTemplate.script.module.exports, vueTemplate.script.module.exports, childLoader, vueTemplate.script.module)

				if (script) {
					var elStyle = doc.createElement('style')
					elStyle.textContent = vueTemplate.script.module.exports.styles.source
					doc.body.appendChild(elStyle)
					vueTemplate.styles = elStyle
					if (vueTemplate.script.module.exports.styles.scoped == true)
						elStyle.attributes.scoped = ''
				}

				if (vueTemplate.styles) {
					var tplSheet = vueTemplate.styles.sheet ? vueTemplate.styles.sheet : vueTemplate.styles.styleSheet;
					var sheet = tplSheet;
					var rules = sheet.cssRules;

					if (vueTemplate.styles.attributes.scoped) {
						try {
							rulesText = addScopes(id, rules, vueTemplate.template.content)
						} catch (err) {
							throw err;
						}
					} else {
						if (rules) {
							for (var i = 0; i < rules.length; i++) {
								var rule = rules[i];
								if (rule.type !== 1)
									continue;
								allSheet.insertRule(rules[i].cssText, allSheet.cssRules.length)
							}
						}
					}
				}

				if (vueTemplate.template)
					vueTemplate.script.module.exports.template = vueTemplate.template.innerHTML

				if (rulesText.length > 0) {
					vueTemplate.script.module.exports.scopedStyles = rulesText
					vueTemplate.script.module.exports.scopedID = id
				}

				var exp = vueTemplate.script.module.exports
				if (vueTemplate.template)
					vueTemplate.template.remove()
				if (vueTemplate.styles)
					vueTemplate.styles.remove()
				vueTemplate.script.remove()

				resolve(exp)
			} catch (error) {
				reject(error)
			}
		})
	)
}


function vue3HttpAsyncLoader(url, name) {
	var comp = parseComponentURL(url);
	return vue3HttpAsyncLoader.loadComponent(comp.url, name);
}

vue3HttpAsyncLoader.httpRequest = function (url) {

	return new Promise(function (resolve, reject) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.responseType = 'text';

		xhr.onreadystatechange = function () {

			if (xhr.readyState === 4) {

				if (xhr.status >= 200 && xhr.status < 300)
					resolve(xhr.responseText);
				else
					reject(xhr.status);
			}
		};

		xhr.send(null);
	});
};

vue3HttpAsyncLoader.loadComponent = loadComponent.bind(vue3HttpAsyncLoader)
/* vue3HttpAsyncLoader.register = async function(App, url) {
    var loader = this.loadComponent.bind(App)
    var comp = parseComponentURL(url);
    var cmp = await loader(comp.url)
    App.component(comp.name, cmp);
}; */
/* vue3HttpAsyncLoader.require = function(moduleName) {
    return window[moduleName];
}; */

vue3HttpAsyncLoader.install = async function (app, options) {
	var lib = this

	app.mixin({
		beforeCreate: function () {
			var loadComponent = lib.loadComponent.bind(app)
			var components = false
			/************* add scope styles *************/
			if (this._.type.scopedStyles) {
				var styleTag = document.createElement("style");
				styleTag.setAttribute('id', 'v-style-' + this._.type.scopedID)
				styleTag.appendChild(document.createTextNode(""));
				// Add the <style> element to the page
				document.head.appendChild(styleTag);
				var allSheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;
				this._.type.scopedStyles.map(function (val) {
					console.log(val)
					allSheet.insertRule(val, allSheet.cssRules.length)
				})
			}
			/************* end of add scope styles *************/

			/************* add child styles *************/
			if (this._.type.components) {
				var components = this._.type.components;
			}

			if (components) {
				for (var componentName in components) {

					if (typeof (components[componentName]) === 'string' && components[componentName].substr(0, 4) === 'url:') {

						var comp = parseComponentURL(components[componentName].substr(4));

						var componentURL = ('_baseURI' in this._) ? resolveURL(this._._baseURI, comp.url) : comp.url;

						components[componentName] = loadComponent(componentURL, componentName)
					}
				}
			}
			/************* end of add child styles *************/
		},
		unmounted: function () {
			/************* removing scoped styles *************/
			if (this._.type.scopedID) {
				var child = document.getElementById('v-style-' + this._.type.scopedID);
				child.parentNode.removeChild(child)
			}
			/************* end of removing scoped styles *************/
		}
	});
};

window.vue3HttpAsyncLoader = vue3HttpAsyncLoader;