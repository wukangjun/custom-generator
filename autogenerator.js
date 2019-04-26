module.exports = 
{
	"router": {
		"entry": "test/pages",
		"output": "test/router/config.js",
		"pattern": "**/index.js",
		"replace": {
			"component": "{router}"
		}
	},
	"struct": {
		"pages": [
			{
				"type": "file",
				"name": "index.js",
				"template": "{index}"
			},
			{
				"type": "file",
				"name": "<inherits>.vue",
				"template": "{avue}"
			},
			{
				"type": "dir",
				"name": "src"
			},
			{
				"type": "dir",
				"name": "style",
				"children": [
					{
						"type": "file",
						"name": "index.scss",
						"template": "{style}"
					}
				]
			}
		]
	},
	"template": {
		"router": "() => import('@/pages[component]')",
		"index": "export default {}",
		"style": ".app-container {}",
		"avue": "\n      <template>\n        <section class=\"app-container [inherit]\"></section>\n      </template>\n\n      <script>\n        /** \n         * \n         * @since: [now]\n        */\n        export default {\n          name: inherit\n        }\n      </script>\n\n      <style>\n      @import './style/index.scss'\n      </style>\n    "
	},
	"variable": {}
}