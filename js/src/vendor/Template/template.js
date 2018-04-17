var UT = UT || {};
/* jshint ignore:start */

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
UT.template = function(str, data) {
    return new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str.replace(/[\r\t\n]/g, " ")
           .replace(/'(?=[^%]*%>)/g,"\t")
           .split("'").join("\\'")
           .split("\t").join("'")
           .replace(/<%=(.+?)%>/g, "',$1,'")
           .split("<%").join("');")
           .split("%>").join("p.push('")
           + "');}return p.join('');")(data || {});
}
/* jshint ignore:end */
