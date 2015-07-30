# rk_ionic


###Плагины необходимые для работы приложения:

- Возможность открытия нативного браузера:<br>
 `cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git`
- Использование одной версии WebView на разных устройствах:<br>
 `cordova plugin add cordova-plugin-crosswalk-webview`
- Устраняет проблемы с сетью в Cordova 5:  
 `ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git`
- Клавиатура
 `ionic plugin add https://github.com/driftyco/ionic-plugins-keyboard.git`
- sqlite
 `cordova plugin add https://github.com/brodysoft/Cordova-SQLitePlugin`
- Copy SQLite Database from assets(Android) or Resources(iOS) to App Directory
 `cordova plugin add https://github.com/an-rahulpandey/cordova-plugin-dbcopy.git`
- авторизация через соцсети
 `bower install ng-cordova-oauth -S`

###Сборка пакета

- cordova build --release android
- jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk alias_name
- zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk Roscontrol.apk

https://play.google.com/apps/publish/?dev_acc=01474632627383622689#AppListPlace


###Соцсети

- для facebook
 `keytool -exportcert -alias alias_name -keystore release-key.keystore | openssl sha1 -binary | openssl base64`
- для vkontakte
 `keytool -exportcert -alias alias_name -keystore release-key.keystore -list -v | grep 'SHA1:' | cut -d ' ' -f 2 | sed 's/://g'`
