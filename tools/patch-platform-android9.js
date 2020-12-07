/** serve --ssl => certificatSetup es
 * enables live loading for android9-devices
 */

const fs = require("fs");

replaceInFile(
    "platforms/android/app/src/main/AndroidManifest.xml",
    /<application/g,
    '<application android:networkSecurityConfig="@xml/network_security_config"'
);
includeNetSecConfig();

function includeNetSecConfig() {
    fs.copyFile('resources/android/xml/network_security_config.xml',
        'platforms/android/app/src/main/res/xml/network_security_config.xml',
        (err) => { if (err) throw  err; });
}

function replaceInFile(file, match, replace) {
    fs.readFile(file, "utf8", function (err,data) {
        if (err) return console.log(err);
        let result = data.replace(match, replace);
        fs.writeFile(file, result, "utf8", function (err) {
            if (err) throw  err;
        });
    });
}
