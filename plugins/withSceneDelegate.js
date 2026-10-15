// TEMPORARY: delete this plugin (and its app.json entry) once the app is on Expo SDK 58, whose
// native template already does all of this; it turns itself off there anyway.
//
// An app LINKED against the iOS 27 SDK (Xcode 27) aborts at launch on iOS 27 unless it adopts the
// UIScene life cycle. SDK 57's `expo` package already ships the scene delegate (`ExpoAppSceneDelegate`:
// creates the window, starts React Native, forwards links, user activities and quick actions,
// RCTLinkingManager included) and the `ExpoReactNativeFactoryProvider` protocol it needs, but SDK 57's
// template never wires them up. This makes SDK 58's template changes on an SDK 57 prebuild:
// - AppDelegate conforms to `ExpoReactNativeFactoryProvider` and no longer creates the window or
//   starts React Native (the scene delegate does), and drops its Linking/Universal Links overrides
// - Info.plist gets the UIApplicationSceneManifest pointing at `SceneDelegate`
// - `SceneDelegate.swift` (a bare `ExpoAppSceneDelegate` subclass) is added to the app target
//
// The AppDelegate edit is a finalized mod, so it runs after every other plugin's AppDelegate edit
// whatever the order in app.json: a plugin that anchors on the template's startReactNative call
// (@tastic/edge-guard) still finds it, and any lines it added after that call are kept.
const fs = require('fs')
const path = require('path')

const { IOSConfig, withDangerousMod, withFinalizedMod, withInfoPlist, withXcodeProject } = require('expo/config-plugins')

const SCENE_DELEGATE_SWIFT = `internal import Expo

@objc(SceneDelegate)
class SceneDelegate: ExpoAppSceneDelegate {
  // Extension point for config plugins.
}
`

// The template's window + startReactNative block, then any lines other plugins appended inside it.
const START_IN_APP_DELEGATE = /#if os\(iOS\) \|\| os\(tvOS\)\n {4}window = UIWindow\(frame: UIScreen\.main\.bounds\)\n {4}factory\.startReactNative\(\n {6}withModuleName: "main",\n {6}in: window,\n {6}launchOptions: launchOptions\)\n((?:(?!#endif)[^\n]*\n)*)#endif\n/
const LINKING_OVERRIDES = /\n {2}\/\/ Linking API\n {2}public override func application\(\n[\s\S]*?\n {2}\/\/ Universal Links\n {2}public override func application\(\n[\s\S]*?\|\| result\n {2}\}\n/
const MOVED_COMMENT = '    // The window is created and React Native is started by `SceneDelegate` under the\n    // scene-based life cycle (required by the iOS 27 SDK).\n'

function sdkMajor(config) {
  return Number(String(config.sdkVersion ?? '').split('.')[0])
}

function replaceOrThrow(source, pattern, replacement, what) {
  if (!pattern.test(source)) {
    throw new Error(`withSceneDelegate: couldn't find ${what} in AppDelegate.swift. The SDK 57 template changed or another plugin edited it; check the generated ios/ project.`)
  }
  return source.replace(pattern, replacement)
}

function toSceneAppDelegate(source) {
  if (source.includes('ExpoReactNativeFactoryProvider')) return source
  let next = replaceOrThrow(source, /class AppDelegate: ExpoAppDelegate \{/, 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {', 'the AppDelegate class line')
  next = replaceOrThrow(next, START_IN_APP_DELEGATE, (_, extra) => MOVED_COMMENT + (extra ? `#if os(iOS) || os(tvOS)\n${extra}#endif\n` : ''), 'the window creation and startReactNative block')
  return replaceOrThrow(next, LINKING_OVERRIDES, '', 'the Linking API / Universal Links overrides')
}

const withSceneAppDelegate = (config) =>
  withFinalizedMod(config, [
    'ios',
    (config) => {
      const appDelegate = IOSConfig.Paths.getAppDelegate(config.modRequest.projectRoot)
      if (appDelegate.language !== 'swift') {
        throw new Error('withSceneDelegate: only a Swift AppDelegate is supported.')
      }
      const next = toSceneAppDelegate(appDelegate.contents)
      if (next !== appDelegate.contents) fs.writeFileSync(appDelegate.path, next)
      return config
    }
  ])

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate'
          }
        ]
      }
    }
    return config
  })

const withSceneDelegateFile = (config) =>
  withDangerousMod(config, [
    'ios',
    (config) => {
      const projectName = IOSConfig.XcodeUtils.getProjectName(config.modRequest.projectRoot)
      fs.writeFileSync(path.join(config.modRequest.platformProjectRoot, projectName, 'SceneDelegate.swift'), SCENE_DELEGATE_SWIFT)
      return config
    }
  ])

const withSceneDelegateInProject = (config) =>
  withXcodeProject(config, (config) => {
    const projectName = IOSConfig.XcodeUtils.getProjectName(config.modRequest.projectRoot)
    const filepath = `${projectName}/SceneDelegate.swift`
    if (!config.modResults.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({ filepath, groupName: projectName, project: config.modResults })
    }
    return config
  })

module.exports = function withSceneDelegate(config) {
  if (sdkMajor(config) >= 58) return config
  return withSceneDelegateInProject(withSceneDelegateFile(withSceneManifest(withSceneAppDelegate(config))))
}
