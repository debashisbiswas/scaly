import React from "react"
import { WebView } from "react-native-webview"

interface MusicXMLViewerProps {
  musicXML: string
  style?: object
  scrollEnabled?: boolean
}

export function MusicXMLViewer({
  musicXML,
  style,
  scrollEnabled = false,
}: MusicXMLViewerProps) {
  const htmlContent = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://unpkg.com/opensheetmusicdisplay@0.8.3/build/opensheetmusicdisplay.min.js"></script>
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
          autoResize: true,
          backend: "svg",
          drawingParameters: "compacttight",
          autoBeam: true,
        },
      );

      osmd
        .load(\`${musicXML}\`)
        .then(() => osmd.render());
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
    />
  )
}
