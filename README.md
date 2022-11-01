# README

This is the repository for the Mojeek App which is built with React Native and published for Android and iOS.

## Requirements

Android Studio
android-platform tools (brew cask install android-platform-tools)
npm

## Getting Started

Make sure you are using npm version 8.9.4 by running `npm -v`. If you are not then switch to this version (`nvm` recommended)
Run `npm install` to bring in the correct node_modules.

## NPM

Run `react-native start` before making any changes.

# Android

For this project to run on android, you'll need to add a `debug.keystore` key inside the `android/app` folder. To do so:

cd `android/app` and then run:

```
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

## Preview App

- Open an Android emulator by selecting a device inside 'Tools -> AVD Manager' in Android Studio (you may need to open an existing project or create a new one in order to reveal the menu that contains 'Tools' in it). The 'play' button in the 'actions' column will start the emulator.
- In terminal run `adb devices` to check the device is connected and then `react-native run-android` to deploy the app to the emulator.
- To preview on a real device close the simulator and plugin the device. `react-native run-android` will then build, install, and start the app on your device.

## Publish

To assemble

`cd android`

and then run...

`./gradlew assembleRelease`

To test the assembled version in the emulator run:

`react-native run-android --variant=release`

Note: to test the release variant with the emulator you will need to first delete the testing variant from the emulator as otherwise this will fail as the signing keys are different.

Once you're happy that the release version is working as it should be, increment the `versionCode` and `versionName` in `android/app/build.gradle`, assemble again and then bundle by running:

`./gradlew bundleRelease`

This will give you an `app-release.aab` file inside `/android/app/build/outputs/bundle/release`

Note: failing to increase the versionCode and versionName will prevent the app from being accepted into the Google Play store as you cannot upload an app with the same versioning twice.

Submit the new app via [https://developer.android.com/distribute/console](https://developer.android.com/distribute/console)

# iOS

## Requirements

- `Xcode 12.5`
- xcode command line tools (xcode-select --install)
## Preview App

- Navigate to `ios/` and run `pod install`. If pod is not installed run `sudo gem install cocoapods`
- In terminal run `react-native run-ios` to deploy the app to the emulator. If you want to choose a specific device to emulate, run `xcrun simctl list devices` to get available device names, copy the name you want and then run, for example, `react-native run-ios --simulator="iPhone 8 Plus"`
- To preview on a real device, connect the device via usb and then run `react-native run-ios --device`. Note that you will need to register your device the first time that you want to test on it. There may be easier ways of doing this but the steps I took are below:

### Registering a testing device

- Plug your device into the computer via USB
- Open the `MojeekApp.xcworkspace` that you'll find inside the `ios` folder in
  xcode: `xed ios/MojeekApp.xcworkspace`
- Run `npm install -g ios-deploy`
- Select your device from the device list near the top of the screen (to the right of the play and stop buttons)
- Press the play button; a prompt about registering the device will appear which you can say 'yes' to.
- The app should then get built, installed, and started on your device.

## Publish
- Run `npm run build:ios`
- Open the `MojeekApp.xcworkspace` that you'll find inside the `ios` folder in xcode: `xed ios/MojeekApp.xcworkspace`
- Make sure you increment the version number before you do the next step. To do this select 'MojeekApp' from the left navigation pane and then, go to 'General' and change the 'Version'.
- Change the device to 'Any iOS Device' and then choose Product -> Archive from the top menu.
- Once the code has finished building a window will appear that allows you to 'Distribute App'. Hit the 'Distribute App' button, choose 'App Store Connect' and then 'Upload'. You can then go to [App Store Connect](https://appstoreconnect.apple.com) update notes about the updated app and then send it for review.
- Screenshots for the App Store were taken using the simulator. 6.5" screenshots = `react-native run-ios --simulator="iPhone 11 Pro Max"` and 5.5" = `react-native run-ios --simulator="iPhone 8 Plus"`

## Tips

- Make sure you use xcworkspace and NOT xcproj files when working with xcode... xcproj will not run.
