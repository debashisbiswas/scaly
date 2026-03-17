import React from "react"
import { WebView } from "react-native-webview"

interface MusicXMLViewerProps {
  musicXML: string
  style?: object
  scrollEnabled?: boolean
  zoomEnabled?: boolean
}

export function MusicXMLViewer({
  musicXML,
  style,
  scrollEnabled = false,
  zoomEnabled = false,
}: MusicXMLViewerProps) {
  const htmlContent = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://unpkg.com/opensheetmusicdisplay@1.9.5/build/opensheetmusicdisplay.min.js"></script>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="osmd-container"></div>
    <script>
      const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(
        "osmd-container",
        {
          backend: "svg",

          autoResize: true,
          autoBeam: true,

          drawingParameters: "compacttight",
        },
      );

      // https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/issues/1372
      osmd.EngravingRules.PageBottomMargin = 0.3

      osmd
        .load(${JSON.stringify(musicXML)})
        .then(osmd.render);
    </script>
  </body>
</html>
  `

  return (
    <WebView
      style={[style]}
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      scrollEnabled={scrollEnabled}
      zoomEnabled={zoomEnabled}
    />
  )
}
