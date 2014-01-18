expressInjector
===============

expressjs middleware for injecting some code in result

usage
`var getSnippet = function(){
     return '<!-- labelSimple -->' +
             '<div>simple snippet</div>';
 }

var snippetExists = function(body){
    return body.indexOf('labelSimple')>=0;
}

var placeholder = "<simpleSnippetPlaceholder/>";`

if placeholder are not specified then snippet was inserted after '<body>' tag

` app.use(require('expressInjector')(getSnippet,snippetExists,placeholder));`

in index.html or other html file

`<html>
    <head></head>
    <body>
        <div>
            Hi people
        </div>
        <simpleSnippetPlaceholder/>
    </body>
</html>`

in result we are have
`<html>
    <head></head>
    <body>
        <div>
            Hi people
        </div>
        <div>simple snippet</div>
    </body>
</html>`